package com.storks.adminandanalytics.controller;

import com.storks.adminandanalytics.dto.UserInitRequest;
import com.storks.adminandanalytics.model.types.RoleType;
import com.storks.adminandanalytics.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/init")
    public ResponseEntity<Void> initUser(
            @RequestBody UserInitRequest req,
            @AuthenticationPrincipal Jwt jwt) {

        userService.initUser(jwt.getSubject(), req.email(), RoleType.valueOf(req.roleType()));
        return ResponseEntity.ok().build();
    }
}