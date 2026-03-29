package com.storks.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.storks.entity.DriverScore;

public interface DriverScoreRepository extends JpaRepository<DriverScore, UUID> {
    Optional<DriverScore> findByDriverId(UUID driverId);
}