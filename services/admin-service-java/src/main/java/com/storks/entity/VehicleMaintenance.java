package com.storks.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

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