package com.storks.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.storks.entity.PrivacySettings;

public interface PrivacySettingsRepository extends JpaRepository<PrivacySettings, UUID> {

    Optional<PrivacySettings> findByUserId(UUID userId);

    void deleteByUserId(UUID userId);   // for clean update
}