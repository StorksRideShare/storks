package com.storks.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.storks.entity.VehicleMaintenance;

public interface VehicleMaintenanceRepository extends JpaRepository<VehicleMaintenance, UUID> {
    List<VehicleMaintenance> findByExpiryDateBefore(LocalDate date);
}