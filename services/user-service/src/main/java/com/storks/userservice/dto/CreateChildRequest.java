package com.storks.userservice.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CreateChildRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        String preferredName,
        String pronouns,
        String dateOfBirth,                   // DD-MM-YYYY, nullable
        String schoolName,
        String schoolAddress,
        String grade,                         // SchoolGrade enum name, nullable
        String frontPictureUrl,
        String sidePictureUrl,
        String identificationDescription,
        List<String> disabilities,
        List<String> medicalNotes,
        List<WeeklyScheduleDto> weeklySchedule
) {}
