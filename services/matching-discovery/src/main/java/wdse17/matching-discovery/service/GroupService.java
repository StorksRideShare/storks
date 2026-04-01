
package wdse17.matching.discovery.service;

import wdse17.matching.discovery.dto.GroupResponse;
import wdse17.matching.discovery.model.Group;
import wdse17.matching.discovery.repository.GroupRepository;
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