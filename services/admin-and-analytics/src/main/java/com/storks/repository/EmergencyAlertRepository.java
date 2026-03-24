package com.storks.repository;

import com.storks.entity.EmergencyAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface EmergencyAlertRepository extends JpaRepository<EmergencyAlert, UUID> {

    List<EmergencyAlert> findByTimestampAfter(Instant since);

    List<EmergencyAlert> findTop10ByOrderByTimestampDesc();
}
