package com.storks.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.storks.service.PrivacyService;

@RestController
@RequestMapping("/api/privacy")
public class PrivacyController {

    private final PrivacyService privacyService;

    public PrivacyController(PrivacyService privacyService) {
        this.privacyService = privacyService;
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getMySettings(Authentication auth) {
        UUID userId = extractUserId(auth);   // ← replace with your real method
        return ResponseEntity.ok(privacyService.getSettings(userId));
    }

    @PostMapping("/settings")
    public ResponseEntity<String> updateSettings(@RequestBody Map<String, Object> settings, Authentication auth) {
        UUID userId = extractUserId(auth);
        privacyService.saveSettings(userId, settings);
        return ResponseEntity.ok("Privacy settings updated successfully");
    }

    // TODO: Improve this with proper UserDetails containing UUID
    private UUID extractUserId(Authentication auth) {
        // Temporary for demo – replace later with JWT claim
        return UUID.fromString("00000000-0000-0000-0000-000000000001");
    }
}