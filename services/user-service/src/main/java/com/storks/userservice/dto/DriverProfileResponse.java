package com.storks.userservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DriverProfileResponse {
    private String id;
    private String userId;
    private String fullName;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String profilePictureUrl;
    private String role;
    private boolean onboarded;
}
