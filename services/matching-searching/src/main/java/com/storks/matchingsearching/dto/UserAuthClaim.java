package com.storks.matchingsearching.dto;

import java.io.Serializable;
import java.util.UUID;

public record UserAuthClaim(String providerUserId, String email, boolean isDeleted, UUID userId) implements Serializable {}
