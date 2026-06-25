package com.example.cmmsApplication.common.observability;

import com.example.cmmsApplication.common.response.ApiErrorCode;
import com.example.cmmsApplication.common.response.ResponseFactory;
import com.example.cmmsApplication.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerMapping;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class RequestLoggingFilter extends OncePerRequestFilter {
    private static final Logger LOGGER = LoggerFactory.getLogger(RequestLoggingFilter.class);
    private static final String USER_ID_MDC_KEY = "userId";

    private final ObservabilityMetrics observabilityMetrics;
    private final UserRepository userRepository;

    public RequestLoggingFilter(ObservabilityMetrics observabilityMetrics, UserRepository userRepository) {
        this.observabilityMetrics = observabilityMetrics;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        long started = System.nanoTime();
        Exception failure = null;
        try {
            filterChain.doFilter(request, response);
        } catch (ServletException | IOException | RuntimeException ex) {
            failure = ex;
            throw ex;
        } finally {
            String userId = resolveUserId();
            if (userId != null) {
                MDC.put(USER_ID_MDC_KEY, userId);
            }
            try {
                logSummary(request, response, started, failure, userId);
            } finally {
                MDC.remove(USER_ID_MDC_KEY);
            }
        }
    }

    private void logSummary(HttpServletRequest request, HttpServletResponse response, long started, Exception failure, String userId) {
        long durationMs = (System.nanoTime() - started) / 1_000_000;
        int status = failure == null ? response.getStatus() : HttpServletResponse.SC_INTERNAL_SERVER_ERROR;
        String errorCode = resolveErrorCode(request, status);
        String method = request.getMethod();
        String path = request.getRequestURI();
        String route = resolveRoute(request, path);
        String outcome = status >= 500 ? "SERVER_ERROR" : status >= 400 ? "CLIENT_ERROR" : "SUCCESS";

        observabilityMetrics.recordApiRequest(method, route, status, outcome, errorCode, durationMs);
        LOGGER.info("request_summary correlationId={} userId={} method={} path={} status={} durationMs={} errorCode={}",
                ResponseFactory.correlationId(request),
                userId,
                method,
                path,
                status,
                durationMs,
                errorCode);
    }

    private String resolveErrorCode(HttpServletRequest request, int status) {
        Object value = request.getAttribute(ResponseFactory.ERROR_CODE_ATTRIBUTE);
        if (value != null) {
            return value.toString();
        }
        return status >= 400 ? ApiErrorCode.INTERNAL_SERVER_ERROR.name() : ApiErrorCode.SUCCESS.name();
    }

    private String resolveRoute(HttpServletRequest request, String fallback) {
        Object pattern = request.getAttribute(HandlerMapping.BEST_MATCHING_PATTERN_ATTRIBUTE);
        return pattern == null ? fallback : pattern.toString();
    }

    private String resolveUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String username = authentication.getName();
        if (username == null || "anonymousUser".equalsIgnoreCase(username)) {
            return null;
        }
        try {
            return userRepository.findByUsername(username)
                    .map((user) -> user.getId() == null ? username : user.getId().toString())
                    .orElse(username);
        } catch (RuntimeException ex) {
            return username;
        }
    }
}
