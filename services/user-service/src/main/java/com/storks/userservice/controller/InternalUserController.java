package com.storks.userservice.controller;

import com.storks.models.dto.UserAuthClaim;
import com.storks.userservice.model.User;
import com.storks.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/internal/users")
@RequiredArgsConstructor
public class InternalUserController {

    private final UserRepository userRepository;

    @GetMapping("/auth")
    public ResponseEntity<UserAuthClaim> getAuthClaim(
            @RequestHeader("X-Internal-Api-Key") String internalApiKey,
            @RequestParam String providerUserId) {

        // The SecurityConfig is responsible for general security, but we do manual check here
        // or we could use an interceptor/filter for it.
        // Doing it manually for simplicity if @PreAuthorize isn't available.
        String expectedKey = System.getenv("INTERNAL_API_KEY");
        if (expectedKey == null || !expectedKey.equals(internalApiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByProviderUserId(providerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        UserAuthClaim claim = new UserAuthClaim(
                user.getProviderUserId(),
                user.getEmail(),
                user.isDeleted(),
                user.getUserId(),
                user.getRole().name()
        );

        return ResponseEntity.ok(claim);
    }
}
