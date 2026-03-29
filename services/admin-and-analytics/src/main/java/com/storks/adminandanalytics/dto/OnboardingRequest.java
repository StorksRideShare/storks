package com.storks.adminandanalytics.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record OnboardingRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String dateOfBirth,        // format: DD-MM-YYYY
        @NotBlank String primaryCountryCode,
        @NotBlank String primaryNumber,
        List<SecondaryPhone> secondaryNumbers, // optional, can be null or empty
        String profilePictureUrl               // nullable — user may skip
) {
    public record SecondaryPhone(
            String countryCode,
            String number
    ) {}
}