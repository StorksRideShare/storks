package com.storks.dto;

import java.time.Instant;
import java.util.UUID;

public class RideEvent {
    private UUID rideId;
    private String status;          // e.g. "scheduled", "active", "completed"
    private UUID driverId;
    private Instant timestamp;
    // Add more fields if your location service sends them (e.g. "locationUpdate", "count")

    // Getters and Setters
    public UUID getRideId() {
        return rideId;
    }

    public void setRideId(UUID rideId) {
        this.rideId = rideId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UUID getDriverId() {
        return driverId;
    }

    public void setDriverId(UUID driverId) {
        this.driverId = driverId;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}