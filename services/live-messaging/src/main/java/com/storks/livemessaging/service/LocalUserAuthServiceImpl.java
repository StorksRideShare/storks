package com.storks.livemessaging.service;

import com.storks.common.auth.UserAuthService;
import com.storks.livemessaging.repositories.UserRepository;
import com.storks.models.Parent;
import com.storks.models.User;
import com.storks.models.dto.UserAuthClaim;
import com.storks.models.types.ProviderType;
import com.storks.models.types.RoleType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Optional;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class LocalUserAuthServiceImpl implements UserAuthService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public UserAuthClaim getUserAuthClaim(String providerUserId, String email, String firstName, String lastName, String pictureUrl) {
        log.info("LocalUserAuthService: resolving claim for {}", providerUserId);
        
        Optional<User> userOpt = userRepository.findByProviderUserId(providerUserId);
        
        User user;
        if (userOpt.isPresent()) {
            user = userOpt.get();
        } else {
            log.info("User {} not found locally, auto-upserting", providerUserId);
            user = new Parent();
            user.setProviderUserId(providerUserId);
            user.setProviderType(ProviderType.CLERK);
            user.setEmail(email != null ? email : "not-provided@storks.app");
            user.setFirstName(firstName != null ? firstName : "Unknown");
            user.setLastName(lastName != null ? lastName : "User");
            user.setProfilePictureUrl(pictureUrl);
            user.setRole(RoleType.PARENT); // Default role
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user.setDeleted(false);
            
            user = userRepository.save(user);
            log.info("Auto-upserted user with ID {}", user.getUserId());
        }

        return new UserAuthClaim(
                user.getProviderUserId(),
                user.getEmail(),
                user.isDeleted(),
                user.getUserId(),
                user.getRole() != null ? user.getRole().name() : "PARENT"
        );
    }
}
