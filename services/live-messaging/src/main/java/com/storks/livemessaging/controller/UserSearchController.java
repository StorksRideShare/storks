package com.storks.livemessaging.controller;

import com.storks.models.dto.UserAuthClaim;
import com.storks.livemessaging.dto.UserSearchResult;
import com.storks.livemessaging.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserSearchController {

    private static final Logger log = LoggerFactory.getLogger(UserSearchController.class);

    private final UserRepository userRepository;

    @GetMapping("/search")
    public ResponseEntity<List<UserSearchResult>> searchUsers(@RequestParam String q, @AuthenticationPrincipal UserAuthClaim claim) {
        log.info("REST: searchUsers - Query: {} | Claim: {}", q, claim != null ? claim.userId() : "NULL");
        if (claim == null || claim.userId() == null) {
            log.warn("REST: searchUsers - Unauthorized attempt");
            return ResponseEntity.status(401).build();
        }

        List<UserSearchResult> results = userRepository.searchByEmailOrId(q).stream()
                .filter(u -> !u.getUserId().equals(claim.userId())) // Don't return self
                .map(u -> new UserSearchResult(
                        u.getUserId(),
                        u.getProviderUserId(),
                        u.getFirstName(),
                        u.getLastName(),
                        u.getEmail(),
                        u.getRole()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(results);
    }
}


