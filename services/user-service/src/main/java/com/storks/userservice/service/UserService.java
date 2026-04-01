package com.storks.userservice.service;

import com.storks.userservice.dto.AuthStatusResponse;
import com.storks.userservice.model.Parent;
import com.storks.userservice.model.User;
import com.storks.userservice.model.types.RoleType;
import com.storks.userservice.repository.ParentRepository;
import com.storks.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;

    public void initUser(String clerkUserId, String email, RoleType role) {
        if (userRepository.existsByProviderUserId(clerkUserId)) return;

        Parent parent = new Parent();
        parent.setProviderUserId(clerkUserId);
        parent.setEmail(email);
        parent.setRole(role);
        // onboarded, banned, deleted default to false — no need to set explicitly

        parentRepository.save(parent);
    }

    public AuthStatusResponse getAuthStatus(String clerkUserId) {
        User user = userRepository.findByProviderUserId(clerkUserId)
                .orElseThrow(() -> new RuntimeException("User not found: " + clerkUserId));

        user.setLastLoggedIn(LocalDateTime.now());
        userRepository.save(user);

        return new AuthStatusResponse(
                user.isBanned(),       // Lombok generates isBanned() for field 'banned'
                user.isOnboarded(),    // Lombok generates isOnboarded() for field 'onboarded'
                user.getUserId().toString(),
                user.getRole().name()
        );
    }
}