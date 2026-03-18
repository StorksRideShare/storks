package com.storks.livemessaging.dto;

public record UserAuthClaim(String providerUserId, String email, boolean isDeleted, java.util.UUID userId) {}
