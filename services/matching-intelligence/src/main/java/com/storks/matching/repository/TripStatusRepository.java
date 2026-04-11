package com.storks.matching.repository;

import com.storks.matching.model.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface TripStatusRepository extends JpaRepository<TripStatus, UUID> {}

