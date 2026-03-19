package com.storks.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "driver_scores")
@Data
public class DriverScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "driver_id", nullable = false, unique = true)
    private UUID driverId;

    @Column(nullable = false)
    private double safetyScore;           // 0.0 to 100.0

    @Column(nullable = false)
    private int totalRides;

    @Column(nullable = false)
    private int incidentsCount;

    @Column(nullable = false)
    private int positiveFeedbackCount;

    @Column(columnDefinition = "jsonb")
    private String safetyFactors;         // e.g. {"onTime": 95, "cleanVehicle": 88, ...}

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;
}