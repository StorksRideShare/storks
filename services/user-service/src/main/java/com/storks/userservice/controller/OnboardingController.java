package com.storks.userservice.controller;

import com.storks.userservice.dto.OnboardingRequest;
import com.storks.userservice.dto.OnboardingResponse;
import com.storks.userservice.service.OnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;

    @PostMapping("/complete")
    public ResponseEntity<OnboardingResponse> complete(
            @RequestBody @Valid OnboardingRequest req,
            @AuthenticationPrincipal Jwt jwt) {

        return ResponseEntity.ok(onboardingService.completeOnboarding(jwt.getSubject(), req));
    }
}