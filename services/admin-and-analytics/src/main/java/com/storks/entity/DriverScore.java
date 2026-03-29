package com.storks.entity;

import java.time.Instant;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

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