package com.storks.admin.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ActivityDTO {
    private String user;
    private String action;
    private String time;
    private String type; // e.g. "safety", "system", "analytics", "billing"
}
