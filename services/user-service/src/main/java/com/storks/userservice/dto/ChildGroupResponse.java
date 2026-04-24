package com.storks.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChildGroupResponse {
    private String id;
    private String groupName;
    private String groupCode;
    private String parentId;
    private String rideId;
    private List<ChildResponse> children;
    private String pickupAddress;
    private Double pickupLatitude;
    private Double pickupLongitude;
    private String dropoffAddress;
    private Double dropoffLatitude;
    private Double dropoffLongitude;
}
