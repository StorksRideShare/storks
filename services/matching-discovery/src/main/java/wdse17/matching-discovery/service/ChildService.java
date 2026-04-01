package wdse17.matching.discovery.service;

import wdse17.matching.discovery.dto.*;
import wdse17.matching.discovery.model.*;
import wdse17.matching.discovery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository childRepository;
    private final GroupRepository groupRepository;

    // 🔥 Add child
    public void addChild(Long groupId, ChildRequest request) {

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Child child = new Child();
        child.setName(request.getName());
        child.setAge(request.getAge());
        child.setPickupLocation(request.getPickupLocation());
        child.setDropLocation(request.getDropLocation());
        child.setGroup(group);

        childRepository.save(child);
    }

    // 🔥 Get children
    public List<ChildResponse> getChildren(Long groupId) {

        List<Child> children = childRepository.findByGroupId(groupId);

        return children.stream()
                .map(c -> new ChildResponse(
                        c.getId(),
                        c.getName(),
                        c.getAge(),
                        c.getPickupLocation(),
                        c.getDropLocation()
                ))
                .collect(Collectors.toList());
    }
}