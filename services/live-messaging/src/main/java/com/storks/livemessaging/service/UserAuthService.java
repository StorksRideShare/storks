package com.storks.livemessaging.service;

import com.storks.livemessaging.dto.UserAuthClaim;
import com.storks.livemessaging.errors.InvalidUserIdException;
import com.storks.livemessaging.model.AuthUser;
import com.storks.livemessaging.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserAuthService {
    private final UserRepository userRepository;

    @Cacheable(value = "userClaims", key = "#providerUserId")
    public UserAuthClaim getUserById(String providerUserId) throws IllegalArgumentException, InvalidUserIdException {
        try {
            UUID id = UUID.fromString(providerUserId);
            return userRepository.findByProviderUserId(id)
                    .map(this::toUserAuthClaim)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        }
        catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidUserIdException("Invalid user ID format" + providerUserId);
        }

    }

    private UserAuthClaim toUserAuthClaim(AuthUser user) {
        return new UserAuthClaim(user.getProviderUserId(), user.getEmail(), user.isDeleted(), user.getUserId());
    }
}
