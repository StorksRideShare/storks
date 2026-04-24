package com.storks.userservice.controller;

import com.storks.userservice.dto.AddChildRequest;
import com.storks.userservice.dto.ApiResponse;
import com.storks.userservice.dto.ChildGroupResponse;
import com.storks.userservice.dto.ChildResponse;
import com.storks.userservice.dto.ParentProfileResponse;
import com.storks.userservice.service.ParentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/parent")
@RequiredArgsConstructor
public class ParentController {

    private final ParentService parentService;

    /** GET /api/v1/parent/profile */
    @GetMapping("/profile")
    public ApiResponse<ParentProfileResponse> getParentProfile(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        ParentProfileResponse profile = parentService.getProfile(jwt.getSubject());
        return ApiResponse.success(profile, "Profile retrieved successfully");
    }

    /** GET /api/v1/parent/groups */
    @GetMapping("/groups")
    public ApiResponse<List<ChildGroupResponse>> getParentGroups(@AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        List<ChildGroupResponse> groups = parentService.getGroups(jwt.getSubject());
        return ApiResponse.success(groups, "Groups retrieved successfully");
    }

    /** POST /api/v1/parent/children — add a child to an existing group */
    @PostMapping("/children")
    public ApiResponse<ChildResponse> addChild(
            @RequestBody @Valid AddChildRequest req,
            @AuthenticationPrincipal Jwt jwt) {
        if (jwt == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        ChildResponse child = parentService.addChild(jwt.getSubject(), req);
        return ApiResponse.success(child, "Child added successfully");
    }
}
