package com.storks.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "emergency_alerts")
@Data
public class EmergencyAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(name = "driver_id")
    private UUID driverId;

    @Column(name = "ride_id")
    private UUID rideId;

    private Double parentLat;
    private Double parentLon;

    private Double driverLat;
    private Double driverLon;

    @Column(nullable = false)
    private String alertType;

    @Column(columnDefinition = "text")
    private String message;

    @CreationTimestamp
    private Instant timestamp;

    private Double distanceKm;
}
