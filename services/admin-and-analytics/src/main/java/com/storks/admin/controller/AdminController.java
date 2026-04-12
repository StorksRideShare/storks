package com.storks.admin.controller;

import com.storks.admin.dto.DashboardStatsDTO;
import com.storks.admin.dto.ActivityDTO;
import com.storks.admin.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
public class AdminController {

    private final AnalyticsService analyticsService;

    @GetMapping("/stats")
    public DashboardStatsDTO getStats() {
        return analyticsService.getDashboardStats();
    }

    @GetMapping("/activity")
    public List<ActivityDTO> getRecentActivity() {
        return analyticsService.getRecentActivity();
    }

    @GetMapping("/notifications")
    public List<com.storks.admin.dto.NotificationDTO> getNotifications() {
        return analyticsService.getLatestNotifications();
    }
}
