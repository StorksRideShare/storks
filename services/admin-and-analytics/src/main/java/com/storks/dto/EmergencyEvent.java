package com.storks.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class EmergencyEvent {
    private UUID parentId;
    private UUID driverId;
    private UUID rideId;
    private Double parentLat;
    private Double parentLon;
    private Double driverLat;
    private Double driverLon;
    private String alertType;
    private String message;
}
