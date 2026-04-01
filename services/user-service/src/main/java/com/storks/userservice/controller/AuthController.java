package com.storks.userservice.controller;

import com.storks.userservice.dto.AuthStatusResponse;
import com.storks.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @GetMapping("/status")
    public ResponseEntity<AuthStatusResponse> status(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(userService.getAuthStatus(jwt.getSubject()));
    }
}