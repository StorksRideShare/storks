package com.storks.controller;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.annotation.JsonView;
import com.storks.dto.ChildDto;
import com.storks.entity.Child;
import com.storks.repository.ChildRepository;
import com.storks.service.PrivacyMaskingService;
import com.storks.views.UserViews;

@RestController
@RequestMapping("/api/children")
public class ChildController {

    private final ChildRepository childRepository;
    private final PrivacyMaskingService privacyMaskingService;

    public ChildController(ChildRepository childRepository, PrivacyMaskingService privacyMaskingService) {
        this.childRepository = childRepository;
        this.privacyMaskingService = privacyMaskingService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChildDto> getChild(@PathVariable UUID id, Authentication authentication) {
        UUID requestingUserId = extractUserId(authentication);
        Child child = childRepository.findById(id).orElseThrow();

        ChildDto dto = ChildDto.fromEntity(child);
        ChildDto maskedDto = dto.applyPrivacyMask(privacyMaskingService, requestingUserId);

        return ResponseEntity.ok(maskedDto);
    }

    @GetMapping("/ride/{rideId}/passengers")
    public ResponseEntity<List<ChildDto>> getRidePassengers(@PathVariable UUID rideId, Authentication authentication) {
        UUID requestingUserId = extractUserId(authentication);
        // fetch ride passengers → map to DTO
        List<Child> children = childRepository.findAll(); // TODO: replace with real query later

        List<ChildDto> maskedList = children.stream()
                .map(ChildDto::fromEntity)
                .map(dto -> dto.applyPrivacyMask(privacyMaskingService, requestingUserId))
                .collect(Collectors.toList());

        return ResponseEntity.ok(maskedList);
    }

    @GetMapping("/admin/{id}")
    @JsonView(UserViews.AdminView.class)
    @PreAuthorize("hasRole('ADMIN')")
    public Child getFullChild(@PathVariable UUID id) {
        return childRepository.findById(id).orElseThrow();
    }

    private UUID extractUserId(Authentication auth) {
        // Optional: dynamic role check can be added here
        String role = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("ROLE_PARENT");
                
        // Temporary – improve later with custom UserDetails containing UUID
        return UUID.fromString("00000000-0000-0000-0000-000000000001");
    }
}