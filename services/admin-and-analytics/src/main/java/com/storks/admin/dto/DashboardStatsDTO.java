package com.storks.admin.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardStatsDTO {
    private String activeRides;
    private String totalRevenue;
    private String onboardedDrivers;
    private String safetyScore;
    private String ridesChange; // e.g. "+12.5%"
    private String revenueChange;
    private String driversChange;
    private String safetyChange;
    private List<ChartDataDTO> revenueChart;
}

@Data
@Builder
class ChartDataDTO {
    private String name;
    private double total;
}
