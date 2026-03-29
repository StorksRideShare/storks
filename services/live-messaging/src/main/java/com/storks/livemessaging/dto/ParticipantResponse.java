package com.storks.livemessaging.dto;

import com.storks.livemessaging.model.types.RoleType;

import java.util.UUID;

public record ParticipantResponse(
        UUID userId,
        String providerUserId,
        String firstName,
        String lastName,
        String email,
        RoleType role,
        boolean isRemoved
) {}
