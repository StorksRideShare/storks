package com.storks.livemessaging.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storks.models.types.RoleType;

import java.util.UUID;

public record ParticipantResponse(
        @JsonProperty("userId") UUID userId,
        @JsonProperty("providerUserId") String providerUserId,
        @JsonProperty("firstName") String firstName,
        @JsonProperty("lastName") String lastName,
        @JsonProperty("email") String email,
        @JsonProperty("role") RoleType role,
        @JsonProperty("isRemoved") boolean isRemoved
) {}


