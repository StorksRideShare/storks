package com.storks.models.dto;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.io.Serializable;
import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "@class")
public record UserAuthClaim(String providerUserId, String email, boolean isDeleted, UUID userId, String role) implements Serializable {}
