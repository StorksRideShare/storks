package com.storks.userservice.service;

import com.storks.common.auth.UserAuthService;
import com.storks.models.dto.UserAuthClaim;
import com.storks.userservice.model.User;
import com.storks.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
@RequiredArgsConstructor
public class LocalUserAuthService implements UserAuthService {

    private final UserRepository userRepository;
    private final UserService userService;

    @Override
    @Cacheable(value = "user_auth_claims", key = "#p0")
    public UserAuthClaim getUserAuthClaim(String providerUserId, String email, String firstName, String lastName, String pictureUrl) {
        User user = userRepository.findByProviderUserId(providerUserId)
                .orElseGet(() -> userService.syncUserMinimal(providerUserId, email, firstName, lastName, pictureUrl));

        return new UserAuthClaim(
                user.getProviderUserId(),
                user.getEmail(),
                user.isDeleted() || user.isBanned(),
                user.getUserId(),
                user.getRole().name()
        );
    }
}
