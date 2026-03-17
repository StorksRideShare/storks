package com.storks.livemessaging.model;

import com.storks.livemessaging.model.types.ProviderType;
import com.storks.livemessaging.model.types.RoleType;
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
    private UUID userId;

    private String email;
    private String passwordHash;

    private String firstName;
    private String lastName;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private ProviderType providerType;

    @Column(nullable = false)
    private String providerUserId;

    @Enumerated(EnumType.STRING)
    private RoleType role;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoggedIn;

    private boolean isDeleted = false;
}
