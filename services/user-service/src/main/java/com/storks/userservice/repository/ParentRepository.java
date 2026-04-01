package com.storks.userservice.repository;

import com.storks.userservice.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ParentRepository extends JpaRepository<Parent, UUID> {
    Optional<Parent> findByProviderUserId(String providerUserId);
}