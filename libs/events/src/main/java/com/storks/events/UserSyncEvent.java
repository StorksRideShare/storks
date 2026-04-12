package com.storks.events;

import com.storks.models.types.ProviderType;
import com.storks.models.types.RoleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserSyncEvent extends BaseEvent {
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private String providerUserId;
    private ProviderType providerType;
    private RoleType role;
    private String profilePictureUrl;
    private boolean onboarded;
    private boolean banned;
    private boolean deleted;
}
