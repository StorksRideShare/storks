package com.storks.userservice.controller;

import com.storks.userservice.dto.ApiResponse;
import com.storks.userservice.dto.AuthStatusResponse;
import com.storks.userservice.dto.DriverProfileResponse;
import com.storks.userservice.service.DriverService;
import com.storks.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/driver")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final UserService userService;

    /** GET /api/v1/driver/profile */
    @GetMapping("/profile")
    public ApiResponse<DriverProfileResponse> getDriverProfile(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        DriverProfileResponse profile = driverService.getProfile(jwt.getSubject());
        return ApiResponse.success(profile, "Driver profile retrieved successfully");
    }

    /** GET /api/v1/driver/status */
    @GetMapping("/status")
    public ApiResponse<AuthStatusResponse> getDriverStatus(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        String providerUserId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        AuthStatusResponse status = userService.getAuthStatusOrSync(providerUserId, email);
        return ApiResponse.success(status, "Driver status retrieved successfully");
    }
}
