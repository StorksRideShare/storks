package com.storks.adminandanalytics.dto;

public record UserInitRequest(
        String email,
        String roleType
) {}