package com.storks.userservice.dto;

public record AuthStatusResponse(
        boolean isBanned,
        boolean isOnboarded,
        String userId,
        String role
) {}