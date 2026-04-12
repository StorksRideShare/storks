package com.storks.admin.service;

import com.storks.admin.dto.DashboardStatsDTO;
import com.storks.admin.dto.ActivityDTO;
import com.storks.admin.dto.NotificationDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final RestClient restClient;

    @Value("${storks.internal.api-key:storks-internal-secret-2024-v1}")
    private String internalApiKey;

    @Cacheable(value = "adminDashboardStats", key = "'all'")
    public DashboardStatsDTO getDashboardStats() {
        // Fetch from User Service
        Map userStats = restClient.get()
                .uri("http://localhost:8083/internal/users/stats")
                .header("X-Internal-Api-Key", internalApiKey)
                .retrieve()
                .body(Map.class);

        // Fetch from Booking Service
        Map bookingStats = restClient.get()
                .uri("http://localhost:8088/api/v1/bookings/stats")
                .header("X-Internal-Api-Key", internalApiKey)
                .retrieve()
                .body(Map.class);

        return DashboardStatsDTO.builder()
                .activeRides(formatValue(bookingStats.get("totalBookings")))
                .totalRevenue("$" + String.format("%.2f", (double)bookingStats.get("totalRevenue")))
                .onboardedDrivers(formatValue(userStats.get("totalDrivers")))
                .safetyScore("99.8%")
                .ridesChange("+12.5%")
                .revenueChange("+18.2%")
                .driversChange("+4.1%")
                .safetyChange("-0.1%")
                .build();
    }

    private String formatValue(Object val) {
        if (val == null) return "0";
        if (val instanceof Number) {
            return String.format("%,d", ((Number) val).longValue());
        }
        return val.toString();
    }

    @Cacheable(value = "adminDashboardActivity", key = "'latest'")
    public List<ActivityDTO> getRecentActivity() {
        // For now, return mock but structure it here
        return Arrays.asList(
                ActivityDTO.builder().user("Sarah J.").action("New driver verification pending").time("2 mins ago").type("safety").build(),
                ActivityDTO.builder().user("System").action("User Service cache flushed").time("15 mins ago").type("system").build(),
                ActivityDTO.builder().user("Booking Service").action("Matching success rate at 94%").time("1 hour ago").type("analytics").build(),
                ActivityDTO.builder().user("Mark R.").action("Payment dispute resolved").time("3 hours ago").type("billing").build()
        );
    }

    @Cacheable(value = "adminNotifications", key = "'all'")
    public List<NotificationDTO> getLatestNotifications() {
        return Arrays.asList(
                NotificationDTO.builder()
                        .id("1")
                        .title("High Surge Detected")
                        .message("Surge pricing active in Downtown area.")
                        .timestamp("5 mins ago")
                        .type("warning")
                        .read(false)
                        .build(),
                NotificationDTO.builder()
                        .id("2")
                        .title("System Update")
                        .message("Maintenance scheduled for 02:00 AM UTC.")
                        .timestamp("1 hour ago")
                        .type("info")
                        .read(false)
                        .build(),
                NotificationDTO.builder()
                        .id("3")
                        .title("New Driver Onboarded")
                        .message("Michael S. completed documentation.")
                        .timestamp("3 hours ago")
                        .type("success")
                        .read(true)
                        .build()
        );
    }
}
