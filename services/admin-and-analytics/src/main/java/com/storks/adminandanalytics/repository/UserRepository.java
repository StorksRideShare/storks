package com.storks.adminandanalytics.repository;

import com.storks.adminandanalytics.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByProviderUserId(String providerUserId);
    boolean existsByProviderUserId(String providerUserId);
}