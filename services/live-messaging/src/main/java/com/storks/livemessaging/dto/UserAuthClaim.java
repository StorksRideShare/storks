package com.storks.livemessaging.dto;

import java.io.Serializable;

public record UserAuthClaim(String providerUserId, String email, boolean isDeleted, java.util.UUID userId) implements Serializable {}
