package com.storks.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddChildRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String preferredName,
        String pronouns,
        String grade,
        String schoolName,
        @NotNull String groupId
) {}
