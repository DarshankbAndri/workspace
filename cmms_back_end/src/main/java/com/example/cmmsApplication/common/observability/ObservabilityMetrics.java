package com.example.cmmsApplication.common.observability;

import com.example.cmmsApplication.approval.repository.ApprovalRequestRepository;
import com.example.cmmsApplication.spareparts.repository.SparePartSiteStockRepository;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Supplier;

@Service
public class ObservabilityMetrics {
    private static final List<String> APPROVAL_TYPES = List.of("ALL", "PM_SCHEDULE", "PM_WORK_ORDER", "MAINTENANCE_REQUEST", "SPARE_ISSUE");

    private final MeterRegistry meterRegistry;
    private final ApprovalRequestRepository approvalRequestRepository;
    private final SparePartSiteStockRepository stockRepository;
    private final long approvalOverdueHours;
    private final AtomicLong notificationLastSuccessEpochSeconds = new AtomicLong(0);
    private final AtomicLong notificationLastFailureEpochSeconds = new AtomicLong(0);

    public ObservabilityMetrics(MeterRegistry meterRegistry,
                                ApprovalRequestRepository approvalRequestRepository,
                                SparePartSiteStockRepository stockRepository,
                                @Value("${cmms.observability.approval-overdue-hours:24}") long approvalOverdueHours) {
        this.meterRegistry = meterRegistry;
        this.approvalRequestRepository = approvalRequestRepository;
        this.stockRepository = stockRepository;
        this.approvalOverdueHours = approvalOverdueHours;
    }

    @PostConstruct
    public void registerGauges() {
        Gauge.builder("cmms.notification.job.last_success_timestamp", notificationLastSuccessEpochSeconds, AtomicLong::get)
                .description("Epoch seconds for last successful notification job run")
                .tag("jobName", "daily_notification_scan")
                .tag("status", "success")
                .register(meterRegistry);
        Gauge.builder("cmms.notification.job.last_failure_timestamp", notificationLastFailureEpochSeconds, AtomicLong::get)
                .description("Epoch seconds for last failed notification job run")
                .tag("jobName", "daily_notification_scan")
                .tag("status", "failure")
                .register(meterRegistry);

        APPROVAL_TYPES.forEach((approvalType) -> {
            Gauge.builder("cmms.approval.pending.count", () -> countSafely(() -> countPendingApprovals(approvalType)))
                    .tag("approvalType", approvalType.toLowerCase())
                    .tag("status", "pending")
                    .register(meterRegistry);
            Gauge.builder("cmms.approval.overdue.count", () -> countSafely(() -> countOverdueApprovals(approvalType)))
                    .tag("approvalType", approvalType.toLowerCase())
                    .tag("status", "pending")
                    .register(meterRegistry);
        });

        Gauge.builder("cmms.inventory.stockout.count", () -> countSafely(stockRepository::countStockOut))
                .register(meterRegistry);
        Gauge.builder("cmms.inventory.low_stock.count", () -> countSafely(stockRepository::countLowStock))
                .register(meterRegistry);
    }

    public void recordApiRequest(String method, String uri, int status, String outcome, String errorCode, long durationMs) {
        Timer.builder("cmms.api.requests")
                .tag("method", safeTag(method))
                .tag("uri", safeTag(uri))
                .tag("status", Integer.toString(status))
                .tag("outcome", safeTag(outcome))
                .register(meterRegistry)
                .record(durationMs, TimeUnit.MILLISECONDS);
        if (status >= 400) {
            Counter.builder("cmms.api.errors")
                    .tag("method", safeTag(method))
                    .tag("uri", safeTag(uri))
                    .tag("status", Integer.toString(status))
                    .tag("errorCode", safeTag(errorCode))
                    .register(meterRegistry)
                    .increment();
        }
    }

    public void recordLoginFailure(String reason, String endpoint) {
        Counter.builder("cmms.auth.login.failures")
                .tag("reason", safeTag(reason))
                .tag("endpoint", safeTag(endpoint))
                .register(meterRegistry)
                .increment();
    }

    public void recordNotificationJob(String jobName, boolean success) {
        Counter.builder(success ? "cmms.notification.job.runs" : "cmms.notification.job.failures")
                .tag("jobName", safeTag(jobName))
                .tag("status", success ? "success" : "failure")
                .register(meterRegistry)
                .increment();
        long now = Instant.now().getEpochSecond();
        if (success) {
            notificationLastSuccessEpochSeconds.set(now);
        } else {
            notificationLastFailureEpochSeconds.set(now);
        }
    }

    public void recordPmGeneration(String status, int generatedWorkOrders, Duration duration) {
        Counter.builder("cmms.pm.generation.runs")
                .tag("status", safeTag(status))
                .register(meterRegistry)
                .increment();
        if ("success".equalsIgnoreCase(status)) {
            Counter.builder("cmms.pm.generation.generated_work_orders")
                    .tag("status", "success")
                    .register(meterRegistry)
                    .increment(Math.max(generatedWorkOrders, 0));
        } else {
            Counter.builder("cmms.pm.generation.failures")
                    .tag("status", safeTag(status))
                    .register(meterRegistry)
                    .increment();
        }
        Timer.builder("cmms.pm.generation.duration")
                .tag("status", safeTag(status))
                .register(meterRegistry)
                .record(duration);
    }

    public void recordStockoutAlert(String status) {
        Counter.builder("cmms.inventory.stockout.alerts")
                .tag("status", safeTag(status))
                .register(meterRegistry)
                .increment();
    }

    private long countPendingApprovals(String approvalType) {
        if ("ALL".equals(approvalType)) {
            return approvalRequestRepository.countByApprovalStatus("PENDING");
        }
        return approvalRequestRepository.countByModuleCodeAndApprovalStatus(approvalType, "PENDING");
    }

    private long countOverdueApprovals(String approvalType) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(approvalOverdueHours);
        if ("ALL".equals(approvalType)) {
            return approvalRequestRepository.countByApprovalStatusAndRequestedAtBefore("PENDING", cutoff);
        }
        return approvalRequestRepository.countByModuleCodeAndApprovalStatusAndRequestedAtBefore(approvalType, "PENDING", cutoff);
    }

    private double countSafely(Supplier<Long> supplier) {
        try {
            return supplier.get();
        } catch (RuntimeException ex) {
            return Double.NaN;
        }
    }

    private String safeTag(String value) {
        return value == null || value.isBlank() ? "unknown" : value;
    }
}
