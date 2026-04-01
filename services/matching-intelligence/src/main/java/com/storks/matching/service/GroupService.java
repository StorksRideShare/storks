
package com.storks.matching.service;

import com.storks.matching.dto.GroupResponse;
import com.storks.matching.model.Group;
import com.storks.matching.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;

    public GroupResponse getGroup(Long id) {

        Group group = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        return new GroupResponse(
                group.getGroupName(),
                group.getMemberName(),
                group.getAge(),
                group.getPickupLocation(),
                group.getDropLocation(),
                group.getDriverName(),
                group.getDriverName() != null,
                group.getStatus(),
                group.getBookingDate()
        );
    }
}