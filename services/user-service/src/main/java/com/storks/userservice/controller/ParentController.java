package com.storks.userservice.controller;

import com.storks.models.Parent;
import com.storks.models.User;
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
    private final com.storks.userservice.repository.ChildGroupRepository childGroupRepository;

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
        if (jwt == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        String providerUserId = jwt.getSubject();
        
        Optional<User> optionalUser = userRepository.findByProviderUserId(providerUserId);
        if (optionalUser.isEmpty() || !(optionalUser.get() instanceof Parent parent)) {
            return Collections.emptyList();
        }

        List<com.storks.models.ChildGroup> groups = childGroupRepository.findByParentUserId(parent.getUserId());
        
        return groups.stream().map(g -> {
            List<Map<String, Object>> children = g.getChildren().stream()
                .map(c -> Map.<String, Object>of(
                    "id", c.getChildId().toString(),
                    "firstName", c.getFirstName() != null ? c.getFirstName() : "",
                    "lastName", c.getLastName() != null ? c.getLastName() : "",
                    "preferredName", c.getPreferredName() != null ? c.getPreferredName() : ""
                )).toList();

            return (Map<String, Object>) Map.of(
                "id", g.getGroupId().toString(),
                "groupName", "Group " + g.getGroupId().toString().substring(0, 8),
                "children", children,
                "rideId", g.getRideId() != null ? g.getRideId().toString() : "ride-today"
            );
        }).toList();
    }
}
