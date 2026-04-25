package com.storks.userservice.dto;

public record WeeklyScheduleDto(
        String dayOfWeek,              // MONDAY … FRIDAY
        String customDropoffAddress,
        String customPickupAddress
) {}
