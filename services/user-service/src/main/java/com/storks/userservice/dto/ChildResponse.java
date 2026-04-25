package com.storks.userservice.dto;

import java.util.List;
import java.util.UUID;

public record ChildResponse(
        UUID childId,
        String firstName,
        String lastName,
        String preferredName,
        String dateOfBirth,           // DD-MM-YYYY
        Integer age,
        String schoolName,
        String frontPictureUrl,
        String qrHash,
        List<String> disabilities,
        List<String> medicalNotes,
        List<WeeklyScheduleDto> weeklySchedule
) {}
