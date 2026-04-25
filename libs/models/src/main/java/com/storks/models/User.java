package com.storks.models;

import com.storks.models.types.ProviderType;
import com.storks.models.types.RoleType;
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

    @Column(name = "provider_type")
    @Enumerated(EnumType.STRING)
    private ProviderType providerType;

    @Column(nullable = false, unique = true)
    private String providerUserId;

    @Enumerated(EnumType.STRING)
    private RoleType role;

    @Column(nullable = false)
    private Boolean onboarded = false;

    public Boolean isOnboarded() {
        return onboarded;
    }

    @Column(nullable = false)
    private Boolean banned = false;

    public Boolean isBanned() {
        return banned;
    }

    @Column(name = "is_deleted", nullable = false)
    private Boolean deleted = false;

    public Boolean isDeleted() {
        return deleted;
    }

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    private LocalDateTime lastLoggedIn;
}
