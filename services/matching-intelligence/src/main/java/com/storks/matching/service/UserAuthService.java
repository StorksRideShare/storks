package com.storks.matching.service;

import com.storks.matching.dto.UserAuthClaim;
import com.storks.matching.entity.User;
import com.storks.matching.errors.InvalidUserIdException;
import com.storks.matching.repository.UserRepository;
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
