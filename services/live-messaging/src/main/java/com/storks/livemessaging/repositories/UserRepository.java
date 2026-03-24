package com.storks.livemessaging.repositories;

import com.storks.livemessaging.model.AuthUser;
import com.storks.livemessaging.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    User findByUserId(UUID userId);
    Optional<AuthUser> findByProviderUserId(String providerUserId);

    @Query("SELECT u FROM User u WHERE " +
           "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "CAST(u.userId AS string) = :query OR " +
           "u.providerUserId = :query")
    List<User> searchByEmailOrId(@Param("query") String query);

    Optional<User> findByEmail(String email);
}

