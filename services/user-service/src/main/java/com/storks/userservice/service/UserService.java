package com.storks.userservice.service;

import com.storks.userservice.dto.AuthStatusResponse;
import com.storks.userservice.model.Parent;
import com.storks.userservice.model.User;
import com.storks.userservice.model.types.RoleType;
import com.storks.userservice.repository.ParentRepository;
import com.storks.userservice.repository.UserRepository;
import com.storks.events.UserSyncEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "storks.users.sync";

    @Transactional
    @CacheEvict(value = "users", key = "#clerkUserId")
    public User syncUser(String clerkUserId, String email, RoleType role) {
        return userRepository.findByProviderUserId(clerkUserId)
                .map(user -> {
                    log.info("User already exists, syncing status: {}", clerkUserId);
                    user.setLastLoggedIn(LocalDateTime.now());
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    log.info("Creating new user via sync: {}", clerkUserId);
                    Parent parent = new Parent();
                    parent.setProviderUserId(clerkUserId);
                    parent.setEmail(email);
                    parent.setRole(role);
                    parent.setLastLoggedIn(LocalDateTime.now());
                    Parent saved = parentRepository.save(parent);
                    sendSyncEvent(saved);
                    return saved;
                });
    }

    @Transactional
    public User syncUserMinimal(String providerUserId, String email, String firstName, String lastName, String pictureUrl) {
        return userRepository.findByProviderUserId(providerUserId)
                .orElseGet(() -> {
                    log.info("Provisioning minimal user: {}", providerUserId);
                    Parent parent = new Parent();
                    parent.setProviderUserId(providerUserId);
                    parent.setEmail(email);
                    parent.setFirstName(firstName);
                    parent.setLastName(lastName);
                    parent.setProfilePictureUrl(pictureUrl);
                    parent.setRole(RoleType.PARENT);
                    parent.setLastLoggedIn(LocalDateTime.now());
                    Parent saved = parentRepository.save(parent);
                    sendSyncEvent(saved);
                    return saved;
                });
    }

    @Transactional
    @CacheEvict(value = "users", key = "#user.providerUserId")
    public void updateUser(User user) {
        userRepository.save(user);
        sendSyncEvent(user);
    }

    private void sendSyncEvent(User user) {
        UserSyncEvent event = UserSyncEvent.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .providerUserId(user.getProviderUserId())
                .providerType(com.storks.models.types.ProviderType.CLERK)
                .role(user.getRole() != null ? com.storks.models.types.RoleType.valueOf(user.getRole().name()) : null)
                .profilePictureUrl(user.getProfilePictureUrl())
                .onboarded(user.isOnboarded())
                .banned(user.isBanned())
                .deleted(user.isDeleted())
                .build();
        
        kafkaTemplate.send(TOPIC, user.getUserId().toString(), event);
    }

    @Transactional
    public AuthStatusResponse getAuthStatusOrSync(String clerkUserId, String email) {
        User user = userRepository.findByProviderUserId(clerkUserId)
                .orElseGet(() -> {
                    log.info("Auto-syncing missing user in auth status: {}", clerkUserId);
                    Parent parent = new Parent();
                    parent.setProviderUserId(clerkUserId);
                    parent.setEmail(email);
                    parent.setRole(RoleType.PARENT); // Default to parent for this flow
                    parent.setLastLoggedIn(LocalDateTime.now());
                    Parent saved = parentRepository.save(parent);
                    sendSyncEvent(saved);
                    return saved;
                });

        user.setLastLoggedIn(LocalDateTime.now());
        userRepository.save(user);
        
        return new AuthStatusResponse(
                user.isBanned(),
                user.isOnboarded(),
                user.getUserId().toString(),
                user.getRole().toString()
        );
    }

    @Transactional
    @Cacheable(value = "users", key = "#clerkUserId")
    public AuthStatusResponse getAuthStatus(String clerkUserId) {
        User user = userRepository.findByProviderUserId(clerkUserId)
                .orElseThrow(() -> new RuntimeException("User not found: " + clerkUserId));

        user.setLastLoggedIn(LocalDateTime.now());
        userRepository.save(user); 
        
        return new AuthStatusResponse(
                user.isBanned(),
                user.isOnboarded(),
                user.getUserId().toString(),
                user.getRole().name()
        );
    }
}