package com.storks.entity;

import java.time.LocalDate;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "vehicle_maintenance")
@Data
public class VehicleMaintenance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "vehicle_id", nullable = false)
    private UUID vehicleId;

    @Column(nullable = false)
    private String maintenanceType;       // "Insurance", "Revenue License", "Service", "Background Check"

    @Column(nullable = false)
    private LocalDate expiryDate;

    private boolean isExpired;

    @Column(columnDefinition = "text")
    private String notes;
}