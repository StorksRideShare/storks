package com.storks.userservice.model;

import com.storks.userservice.model.types.RoleType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "user_type", discriminatorType = DiscriminatorType.STRING)
@Table(name = "users")
public abstract class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID userId;

    private String email;
    private String firstName;
    private String lastName;
    private String profilePictureUrl;

    // Clerk's user ID e.g. "user_2abc123"
    @Column(nullable = false, unique = true)
    private String providerUserId;

    @Enumerated(EnumType.STRING)
    private RoleType role;

    // Renamed from isOnboarded → onboarded to avoid Lombok/JPA is-prefix conflict
    @Column(nullable = false)
    private boolean onboarded = false;

    // Renamed from isBanned → banned
    @Column(nullable = false)
    private boolean banned = false;

    // Renamed from isDeleted → deleted
    @Column(nullable = false)
    private boolean deleted = false;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoggedIn;
}