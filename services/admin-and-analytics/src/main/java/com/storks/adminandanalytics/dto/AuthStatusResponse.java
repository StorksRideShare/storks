package com.storks.adminandanalytics.dto;

public record AuthStatusResponse(
        boolean isBanned,
        boolean isOnboarded,
        String userId,
        String role
) {}