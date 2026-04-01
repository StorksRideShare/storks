package com.storks.matchingsearching.repository;

import com.storks.matchingsearching.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByProviderUserId(String providerUserId);
}
