package com.storks.adminandanalytics.controller;

import com.storks.adminandanalytics.dto.OnboardingRequest;
import com.storks.adminandanalytics.dto.OnboardingResponse;
import com.storks.adminandanalytics.service.OnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/onboarding")
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