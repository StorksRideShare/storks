package com.storks.userservice.dto;

public record UserInitRequest(
        String email,
        String roleType
) {}