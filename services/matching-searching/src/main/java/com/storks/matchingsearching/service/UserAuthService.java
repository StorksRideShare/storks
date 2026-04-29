package com.storks.matchingsearching.service;

import com.storks.matchingsearching.dto.UserAuthClaim;
import com.storks.matchingsearching.entity.User;
import com.storks.matchingsearching.errors.InvalidUserIdException;
import com.storks.matchingsearching.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserAuthService {
    private final UserRepository userRepository;

    @Cacheable(value = "userClaims", key = "#providerUserId")
    public UserAuthClaim getUserById(String providerUserId) throws IllegalArgumentException, InvalidUserIdException {
        try {
            return userRepository.findByProviderUserId(providerUserId)
                    .map(this::toUserAuthClaim)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new InvalidUserIdException("Invalid user ID format " + providerUserId);
        }
    }

    private UserAuthClaim toUserAuthClaim(User user) {
        return new UserAuthClaim(user.getProviderUserId(), user.getEmail(), user.isDeleted(), user.getUserId());
    }
}
