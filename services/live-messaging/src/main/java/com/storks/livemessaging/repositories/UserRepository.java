package com.storks.livemessaging.repositories;

import com.storks.livemessaging.model.AuthUser;
import com.storks.livemessaging.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByUserId(UUID userId);
    Optional<AuthUser> findByProviderUserId(UUID providerUserId);
}
