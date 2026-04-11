package com.storks.matching.repository;

import com.storks.matching.model.DriverProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface DriverProfileRepository extends JpaRepository<DriverProfile, UUID> {}

