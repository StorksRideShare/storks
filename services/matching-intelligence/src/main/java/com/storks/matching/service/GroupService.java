package com.storks.matching.service;

import java.util.UUID;
import com.storks.matching.dto.GroupResponse;
import com.storks.models.ChildGroup;
import com.storks.events.ChildGroupSyncEvent;
import com.storks.matching.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final String TOPIC = "storks.matching.group.sync";

    public void saveGroup(ChildGroup group) {
        groupRepository.save(group);
        sendSyncEvent(group);
    }

    private void sendSyncEvent(ChildGroup group) {
        // Just as an example, if there were properties like name/description we'd set them here
        ChildGroupSyncEvent event = ChildGroupSyncEvent.builder()
                .groupId(group.getGroupId())
                .name("Group " + group.getGroupId())
                .description("Replicated group")
                .build();

        kafkaTemplate.send(TOPIC, group.getGroupId().toString(), event);
    }

    public GroupResponse getGroup(UUID id) {

        ChildGroup childGroup = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ChildGroup not found"));

        String groupName = childGroup.getChildren().stream()
                .map(child -> child.getPreferredName() != null ? child.getPreferredName() : child.getFirstName())
                .collect(Collectors.joining(", "));

        String pickup = childGroup.getPickupLocation() != null ? 
            (childGroup.getPickupLocation().getNickname() != null ? childGroup.getPickupLocation().getNickname() : childGroup.getPickupLocation().getAddress()) : null;
        
        String dropoff = childGroup.getDefaultDropOffLocation() != null ? 
            (childGroup.getDefaultDropOffLocation().getNickname() != null ? childGroup.getDefaultDropOffLocation().getNickname() : childGroup.getDefaultDropOffLocation().getAddress()) : null;

        return new GroupResponse(
                groupName,
                groupName, // member name
                10, // fake age
                pickup,
                dropoff,
                null, // driverName handled by booking now
                false, // isAssignedDriver
                "PENDING",
                null
        );
    }
}
