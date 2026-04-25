package com.storks.userservice.controller;

import com.storks.userservice.dto.ChildResponse;
import com.storks.userservice.dto.CreateChildRequest;
import com.storks.userservice.service.ChildService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/children")
@RequiredArgsConstructor
public class ChildController {

    private final ChildService childService;

    @PostMapping
    public ResponseEntity<ChildResponse> addChild(
            @RequestBody @Valid CreateChildRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(childService.addChild(jwt.getSubject(), req));
    }

    @GetMapping
    public ResponseEntity<List<ChildResponse>> getChildren(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(childService.getChildren(jwt.getSubject()));
    }

    @DeleteMapping("/{childId}")
    public ResponseEntity<Void> deleteChild(
            @PathVariable UUID childId,
            @AuthenticationPrincipal Jwt jwt) {
        childService.deleteChild(jwt.getSubject(), childId);
        return ResponseEntity.noContent().build();
    }
}
