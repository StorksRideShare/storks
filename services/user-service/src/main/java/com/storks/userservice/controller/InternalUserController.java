package com.storks.userservice.controller;

import com.storks.userservice.dto.ApiResponse;
import com.storks.models.dto.UserAuthClaim;
import com.storks.userservice.model.User;
import com.storks.userservice.repository.UserRepository;
import com.storks.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private final UserRepository userRepository;
    private final UserService userService;
    private final String internalApiKey;

    public InternalUserController(
            UserRepository userRepository,
            UserService userService,
            @Value("${storks.internal.api-key}") String internalApiKey) {
        this.userRepository = userRepository;
        this.userService = userService;
        this.internalApiKey = internalApiKey;
    }

    @GetMapping("/auth")
    @Cacheable(value = "user_auth_claims", key = "#p1")
    public UserAuthClaim getAuthClaim(
            @RequestHeader("X-Internal-Api-Key") String internalApiKey,
            @RequestParam String providerUserId,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String firstName,
            @RequestParam(required = false) String lastName,
            @RequestParam(required = false) String pictureUrl) {

        if (this.internalApiKey == null || !this.internalApiKey.equals(internalApiKey)) {
             throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid internal API key");
        }

        User user = userRepository.findByProviderUserId(providerUserId)
                .orElseGet(() -> {
                    if (email != null) {
                        return userService.syncUserMinimal(providerUserId, email, firstName, lastName, pictureUrl);
                    }
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found and no email provided for auto-provisioning");
                });

        UserAuthClaim claim = new UserAuthClaim(
                user.getProviderUserId(),
                user.getEmail(),
                user.isDeleted(),
                user.getUserId(),
                user.getRole().name()
        );

        return claim;
    }

    @GetMapping("/stats")
    public ApiResponse<java.util.Map<String, Object>> getStats() {
        long totalUsers = userRepository.count();
        long totalDrivers = (long) (totalUsers * 0.15);
        
        return ApiResponse.success(java.util.Map.of(
            "totalUsers", totalUsers,
            "totalDrivers", totalDrivers
        ), "Stats retrieved successfully");
    }
}
