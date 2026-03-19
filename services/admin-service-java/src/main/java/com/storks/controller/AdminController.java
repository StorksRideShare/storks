package com.storks.controller;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.storks.service.MetricsService;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")  // Only admins can access these endpoints
public class AdminController {

    private final MetricsService metricsService;

    public AdminController(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    /**
     * Returns current real-time metrics for the admin dashboard
     * (active rides count comes from Kafka consumption)
     */
    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        
        metrics.put("activeRides", metricsService.getActiveRidesCount());
        metrics.put("timestamp", Instant.now().toString());
        
        // You can add more mock or real metrics here for the demo
        metrics.put("cpuUsage", 42);                    // mock for now
        metrics.put("memoryUsagePercent", 68);          // mock
        metrics.put("locationUpdatesLastMinute", 124);  // can be real later
        
        return ResponseEntity.ok(metrics);
    }

    /**
     * Optional: Simple health check endpoint for observability
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new HashMap<>();
        status.put("status", "UP");
        status.put("service", "admin-service");
        status.put("time", Instant.now().toString());
        return ResponseEntity.ok(status);
    }
}