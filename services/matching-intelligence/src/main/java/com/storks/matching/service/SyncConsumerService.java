package com.storks.matching.service;

import com.storks.events.UserSyncEvent;
import com.storks.models.Driver;
import com.storks.models.Parent;
import com.storks.models.User;
import com.storks.matching.repository.DriverRepository;
import com.storks.matching.repository.ParentRepository;
import com.storks.matching.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SyncConsumerService {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final DriverRepository driverRepository;

    @KafkaListener(topics = "storks.users.sync", groupId = "matching-service-group")
    @Transactional
    public void consumeUserSyncEvent(UserSyncEvent event) {
        log.info("Received user sync event: {}", event.getUserId());
        
        switch (event.getRole()) {
            case PARENT:
                Parent parent = parentRepository.findById(event.getUserId()).orElse(new Parent());
                updateCommonUserFields(parent, event);
                parentRepository.save(parent);
                break;
            case DRIVER:
                Driver driver = driverRepository.findById(event.getUserId()).orElse(new Driver());
                updateCommonUserFields(driver, event);
                driverRepository.save(driver);
                break;
            default:
                break;
        }
    }

    private void updateCommonUserFields(User user, UserSyncEvent event) {
        if (user.getUserId() == null) {
            user.setUserId(event.getUserId());
        }
        user.setEmail(event.getEmail());
        user.setFirstName(event.getFirstName());
        user.setLastName(event.getLastName());
        user.setProviderUserId(event.getProviderUserId());
        user.setProviderType(event.getProviderType());
        user.setRole(event.getRole());
        user.setProfilePictureUrl(event.getProfilePictureUrl());
        user.setOnboarded(event.isOnboarded());
        user.setBanned(event.isBanned());
    }
}
