package com.storks.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.storks.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
}