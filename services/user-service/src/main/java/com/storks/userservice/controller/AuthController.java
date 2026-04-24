package com.storks.userservice.controller;

import com.storks.userservice.dto.ApiResponse;
import com.storks.userservice.dto.AuthStatusResponse;
import com.storks.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @GetMapping("/status")
    public ApiResponse<AuthStatusResponse> status(@AuthenticationPrincipal Jwt jwt) {
        String providerUserId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");
        AuthStatusResponse response = userService.getAuthStatusOrSync(providerUserId, email);
        return ApiResponse.success(response, "Authentication status retrieved successfully");
    }
}
