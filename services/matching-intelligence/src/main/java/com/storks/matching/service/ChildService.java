package com.storks.matching.service;

import java.util.UUID;
import com.storks.matching.dto.*;
import com.storks.models.*;
import com.storks.matching.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChildService {

    private final ChildRepository childRepository;
    private final GroupRepository groupRepository;

    public void addChild(UUID groupId, ChildRequest request) {

        ChildGroup childGroup = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("ChildGroup not found"));

        Child child = new Child();
        child.setFirstName(request.getName());
        child.setPreferredName(request.getName());
        child.setGroup(childGroup);

        childRepository.save(child);
    }

    public List<ChildResponse> getChildren(UUID groupId) {

        ChildGroup childGroup = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("ChildGroup not found"));

        List<Child> children = childGroup.getChildren();

        return children.stream()
                .map(c -> new ChildResponse(
                        c.getChildId(),
                        c.getPreferredName() != null ? c.getPreferredName() : c.getFirstName(),
                        10, // fake age
                        "Group Pickup",
                        "Group Dropoff"
                ))
                .collect(Collectors.toList());
    }
}
