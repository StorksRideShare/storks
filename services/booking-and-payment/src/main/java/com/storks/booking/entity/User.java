package com.storks.booking.entity;

import com.storks.booking.entity.types.ProviderType;
import com.storks.booking.entity.types.RoleType;
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
@DiscriminatorColumn(name = "user_type",  discriminatorType = DiscriminatorType.STRING)
@Table(name = "users")
public abstract class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "email")
    private String email;

    @Column(name = "first_name")
    private String firstName;
    
    @Column(name = "last_name")
    private String lastName;

    @Column(name = "provider_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ProviderType providerType;

    @Column(name = "provider_user_id", nullable = false, unique = true)
    private String providerUserId;

    @Column(name = "role")
    @Enumerated(EnumType.STRING)
    private RoleType role;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @Column(name = "onboarded", nullable = false)
    private boolean onboarded = false;

    @Column(name = "banned", nullable = false)
    private boolean banned = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_logged_in")
    private LocalDateTime lastLoggedIn;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;
}
