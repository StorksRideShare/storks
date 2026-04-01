package com.storks.booking.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.storks.booking.dto.ChildDTO;
import com.storks.booking.dto.ChildGroupDTO;
import com.storks.booking.entity.ChildGroup;
import com.storks.booking.repository.ChildGroupRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChildGroupService {

    @Autowired
    private ChildGroupRepository childGroupRepository;

    public List<ChildGroupDTO> getChildGroupsByParent(UUID parentId) {
        return childGroupRepository.findByParentId(parentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private ChildGroupDTO mapToDTO(ChildGroup group) {
        List<ChildDTO> children = group.getChildren().stream()
                .map(child -> ChildDTO.builder()
                        .childId(child.getChildId())
                        .firstName(child.getFirstName())
                        .lastName(child.getLastName())
                        .preferredName(child.getPreferredName())
                        .build())
                .collect(Collectors.toList());

        // Construct a group name from children names
        String groupName = children.stream()
                .map(ChildDTO::getFirstName)
                .collect(Collectors.joining(", "));

        String dropLocation = null;
        if (group.getDefaultDropoffLocation() != null) {
            dropLocation = group.getDefaultDropoffLocation().getNickname() != null ?
                    group.getDefaultDropoffLocation().getNickname() : group.getDefaultDropoffLocation().getAddress();
        }

        return ChildGroupDTO.builder()
                .groupId(group.getGroupId())
                .groupName(groupName)
                .children(children)
                .defaultDropLocation(dropLocation)
                .build();
    }
}
