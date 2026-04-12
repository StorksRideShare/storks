package com.storks.userservice.controller;

import com.storks.userservice.dto.ApiResponse;
import com.storks.userservice.dto.UserInitRequest;
import com.storks.userservice.model.User;
import com.storks.userservice.model.types.RoleType;
import com.storks.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/sync")
    public ApiResponse<User> sync(
            @RequestBody UserInitRequest req,
            @AuthenticationPrincipal Jwt jwt) {

        User user = userService.syncUser(jwt.getSubject(), req.email(), RoleType.valueOf(req.roleType()));
        return ApiResponse.success(user, "User synchronized successfully");
    }
}