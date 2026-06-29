package com.example.cmmsApplication.common.security;


import com.example.cmmsApplication.common.response.ApiErrorCode;
import com.example.cmmsApplication.common.response.ApiErrorResponse;
import com.example.cmmsApplication.common.response.ResponseFactory;
import com.example.cmmsApplication.common.observability.ObservabilityMetrics;
import com.example.cmmsApplication.common.security.service.ApiPermissionService;
import com.example.cmmsApplication.user.entity.User;
import com.example.cmmsApplication.user.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final ObservabilityMetrics observabilityMetrics;
    private final UserRepository userRepository;
    private final ApiPermissionService apiPermissionService;
    private final ObjectMapper objectMapper;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        final String authorizationHeader = request.getHeader("Authorization");
        String username = null;
        String jwt = null;
        
        try {
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                jwt = authorizationHeader.substring(7);
                
                if (jwtUtil.validateToken(jwt)) {
                    username = jwtUtil.extractUsername(jwt);
                }
            }
        } catch (Exception e) {
            observabilityMetrics.recordLoginFailure("invalid_token", request.getRequestURI());
            logger.warn("Cannot set user authentication: " + e.getMessage());
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (userOptional.isEmpty() || !Boolean.TRUE.equals(userOptional.get().getActive())) {
                SecurityContextHolder.clearContext();
                writeError(response, request, HttpStatus.UNAUTHORIZED, ApiErrorCode.INVALID_TOKEN,
                        "Authentication token is not linked to an active user.");
                return;
            }

            User user = userOptional.get();
            UsernamePasswordAuthenticationToken authenticationToken =
                    new UsernamePasswordAuthenticationToken(username, null, new ArrayList<>());
            authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            if (requiresPermissionCheck(request)) {
                boolean allowed;
                try {
                    allowed = apiPermissionService.hasPermission(
                            user.getId().toString(),
                            request.getRequestURI(),
                            request.getMethod()
                    );
                } catch (Exception ex) {
                    logger.error("API permission validation failed for method="
                            + request.getMethod() + " path=" + request.getRequestURI(), ex);
                    allowed = false;
                }
                if (!allowed) {
                    SecurityContextHolder.clearContext();
                    writeError(response, request, HttpStatus.FORBIDDEN, ApiErrorCode.API_PERMISSION_DENIED,
                            "You do not have permission to access this API.");
                    return;
                }
            }
        }
        
        filterChain.doFilter(request, response);
    }

    private boolean requiresPermissionCheck(HttpServletRequest request) {
        return !"OPTIONS".equalsIgnoreCase(request.getMethod())
                && !apiPermissionService.isPublicApi(request.getRequestURI());
    }

    private void writeError(HttpServletResponse response, HttpServletRequest request, HttpStatus status,
                            ApiErrorCode code, String message) throws IOException {
        ApiErrorResponse errorResponse = ResponseFactory.errorBody(status, code, message, List.of(), request);
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), errorResponse);
    }
}
