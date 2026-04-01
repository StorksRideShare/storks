package com.storks.userservice.dto;

public record OnboardingResponse(
        boolean success,
        String message
) {}