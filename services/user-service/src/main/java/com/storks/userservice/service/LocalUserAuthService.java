package com.storks.userservice.service;

import com.clerk.backend_api.Clerk;
import com.storks.common.auth.UserAuthService;
import com.storks.models.dto.UserAuthClaim;
import com.storks.models.User;
import com.storks.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class LocalUserAuthService implements UserAuthService {

    private final UserRepository userRepository;
    private final UserService userService;
    private final Clerk clerk;

    @Override
    @Cacheable(value = "user_auth_claims_v4", key = "#p0")
    public UserAuthClaim getUserAuthClaim(String providerUserId, String email, String firstName, String lastName, String pictureUrl) {
        
        String finalEmail = email;
        String finalFirstName = firstName;
        String finalLastName = lastName;
        String finalPictureUrl = pictureUrl;

        try {
            var response = clerk.users().get(providerUserId);
            if (response.user().isPresent()) {
                com.clerk.backend_api.models.components.User clerkUser = response.user().get();
                if (clerkUser.firstName().isPresent()) finalFirstName = clerkUser.firstName().get();
                if (clerkUser.lastName().isPresent()) finalLastName = clerkUser.lastName().get();
                if (clerkUser.imageUrl().isPresent()) finalPictureUrl = clerkUser.imageUrl().get();
                if (clerkUser.emailAddresses() != null && !clerkUser.emailAddresses().isEmpty()) {
                    finalEmail = clerkUser.emailAddresses().get(0).emailAddress();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to fetch user {} from Clerk, falling back to JWT claims: {}", providerUserId, e.getMessage());
        }

        String ef = finalEmail;
        String fn = finalFirstName;
        String ln = finalLastName;
        String pu = finalPictureUrl;

        User user = userRepository.findByProviderUserId(providerUserId)
                .orElseGet(() -> userService.syncUserMinimal(providerUserId, ef, fn, ln, pu));

        return new UserAuthClaim(
                user.getProviderUserId(),
                user.getEmail(),
                user.isDeleted() || user.isBanned(),
                user.getUserId(),
                user.getRole().name()
        );
    }
}
