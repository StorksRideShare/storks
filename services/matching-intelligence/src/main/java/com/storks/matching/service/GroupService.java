package com.storks.matching.service;

import java.util.UUID;
import com.storks.matching.dto.GroupResponse;
import com.storks.models.ChildGroup;
import com.storks.matching.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;

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
