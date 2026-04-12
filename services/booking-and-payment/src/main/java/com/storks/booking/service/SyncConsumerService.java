package com.storks.booking.service;

import com.storks.events.ChildGroupSyncEvent;
import com.storks.events.ChildSyncEvent;
import com.storks.events.UserSyncEvent;
import com.storks.models.Child;
import com.storks.models.ChildGroup;
import com.storks.models.Driver;
import com.storks.models.Parent;
import com.storks.models.User;
import com.storks.booking.repository.ChildRepository;
import com.storks.booking.repository.DriverRepository;
import com.storks.booking.repository.ParentRepository;
import com.storks.booking.repository.UserRepository;
import com.storks.booking.repository.ChildGroupRepository;
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
    private final ChildRepository childRepository;
    private final ChildGroupRepository childGroupRepository;

    @KafkaListener(topics = "storks.users.sync", groupId = "booking-service-group")
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
        if (user.getUserId() == null) { // Actually Spring Data JPA will set ID differently or we can set it
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

    @KafkaListener(topics = "storks.matching.child.sync", groupId = "booking-service-group")
    @Transactional
    public void consumeChildSyncEvent(ChildSyncEvent event) {
        log.info("Received child sync event: {}", event.getChildId());
        Child child = childRepository.findById(event.getChildId()).orElse(new Child());
        child.setChildId(event.getChildId());
        
        if (event.getParentId() != null) {
            parentRepository.findById(event.getParentId()).ifPresent(child::setParent);
        }
        
        child.setFirstName(event.getFirstName());
        child.setLastName(event.getLastName());
        child.setPreferredName(event.getPreferredName());
        child.setGrade(event.getGrade());
        child.setQrHash(event.getQrHash());
        
        childRepository.save(child);
    }

    @KafkaListener(topics = "storks.matching.group.sync", groupId = "booking-service-group")
    @Transactional
    public void consumeGroupSyncEvent(ChildGroupSyncEvent event) {
        log.info("Received group sync event: {}", event.getGroupId());
        ChildGroup group = childGroupRepository.findById(event.getGroupId()).orElse(new ChildGroup());
        group.setGroupId(event.getGroupId());
        // For matching intelligence we just need basic info synced over to resolve entities
        
        childGroupRepository.save(group);
    }
}
