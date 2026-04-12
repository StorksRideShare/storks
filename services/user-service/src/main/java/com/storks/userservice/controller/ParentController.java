package com.storks.userservice.controller;

import com.storks.userservice.model.Parent;
import com.storks.userservice.model.User;
import com.storks.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/parent")
@RequiredArgsConstructor
public class ParentController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public Map<String, Object> getParentProfile(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        String providerUserId = jwt.getSubject();
        
        Optional<User> optionalUser = userRepository.findByProviderUserId(providerUserId);
        if (optionalUser.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent profile not found");
        }
        User user = optionalUser.get();
        String phone = user instanceof Parent p && p.getContactPrimaryNumber() != null ? 
            p.getContactPrimaryNumber().getCountryCode() + p.getContactPrimaryNumber().getNumber() : "";

        return Map.of(
            "id", user.getUserId().toString(),
            "userId", user.getUserId().toString(),
            "fullName", (user.getFirstName() != null ? user.getFirstName() : "") + " " + (user.getLastName() != null ? user.getLastName() : ""),
            "email", user.getEmail() != null ? user.getEmail() : "",
            "phone", phone,
            "profilePictureUrl", user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : ""
        );
    }

    @GetMapping("/groups")
    public List<Map<String, Object>> getParentGroups(@AuthenticationPrincipal Jwt jwt) {
        // Groups are managed by matching-intelligence service.
        // Returning an empty list locally as there's no native cross-service group query here yet.
        return Collections.emptyList();
    }
}
