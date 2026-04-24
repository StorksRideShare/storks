package com.storks.userservice.service;

import com.storks.models.Child;
import com.storks.models.ChildGroup;
import com.storks.models.Location;
import com.storks.models.Parent;
import com.storks.models.User;
import com.storks.userservice.dto.AddChildRequest;
import com.storks.userservice.dto.ChildGroupResponse;
import com.storks.userservice.dto.ChildResponse;
import com.storks.userservice.dto.ParentProfileResponse;
import com.storks.userservice.repository.ChildGroupRepository;
import com.storks.userservice.repository.ParentRepository;
import com.storks.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ParentService {

    private final UserRepository userRepository;
    private final ParentRepository parentRepository;
    private final ChildGroupRepository childGroupRepository;

    // ── Profile ───────────────────────────────────────────────────────────────

    public ParentProfileResponse getProfile(String providerUserId) {
        User user = userRepository.findByProviderUserId(providerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent profile not found"));

        String phone = "";
        if (user instanceof Parent p && p.getContactPrimaryNumber() != null) {
            phone = p.getContactPrimaryNumber().getCountryCode() + p.getContactPrimaryNumber().getNumber();
        }

        String fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " "
                + (user.getLastName() != null ? user.getLastName() : "")).trim();

        return ParentProfileResponse.builder()
                .id(user.getUserId().toString())
                .userId(user.getUserId().toString())
                .fullName(fullName)
                .firstName(user.getFirstName() != null ? user.getFirstName() : "")
                .lastName(user.getLastName() != null ? user.getLastName() : "")
                .email(user.getEmail() != null ? user.getEmail() : "")
                .phone(phone)
                .profilePictureUrl(user.getProfilePictureUrl() != null ? user.getProfilePictureUrl() : "")
                .onboarded(user.isOnboarded())
                .build();
    }

    // ── Groups ────────────────────────────────────────────────────────────────

    public List<ChildGroupResponse> getGroups(String providerUserId) {
        User user = userRepository.findByProviderUserId(providerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!(user instanceof Parent parent)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User is not a parent");
        }

        List<ChildGroup> groups = childGroupRepository.findByParent_UserId(parent.getUserId());
        return groups.stream().map(this::toGroupResponse).toList();
    }

    // ── Add Child ─────────────────────────────────────────────────────────────

    @Transactional
    public ChildResponse addChild(String providerUserId, AddChildRequest req) {
        Parent parent = parentRepository.findByProviderUserId(providerUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parent not found"));

        UUID groupId;
        try {
            groupId = UUID.fromString(req.groupId());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid groupId format");
        }

        ChildGroup group = childGroupRepository.findById(groupId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        // Verify the group belongs to this parent
        if (group.getParent() == null || !group.getParent().getUserId().equals(parent.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Group does not belong to this parent");
        }

        Child child = new Child();
        child.setFirstName(req.firstName());
        child.setLastName(req.lastName());
        child.setPreferredName(req.preferredName());
        child.setPronouns(req.pronouns());
        child.setParent(parent);
        child.setGroup(group);

        group.getChildren().add(child);
        childGroupRepository.save(group);

        // The child was cascade-saved via the group
        Child saved = group.getChildren().stream()
                .filter(c -> req.firstName().equals(c.getFirstName()) && req.lastName().equals(c.getLastName()))
                .reduce((a, b) -> b) // last match — the one we just added
                .orElse(child);

        return toChildResponse(saved, parent.getUserId().toString(), group.getGroupId().toString());
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private ChildGroupResponse toGroupResponse(ChildGroup g) {
        List<ChildResponse> children = g.getChildren().stream()
                .map(c -> toChildResponse(
                        c,
                        g.getParent() != null ? g.getParent().getUserId().toString() : "",
                        g.getGroupId().toString()))
                .toList();

        Location pickup  = g.getPickupLocation();
        Location dropoff = g.getDefaultDropOffLocation();

        return ChildGroupResponse.builder()
                .id(g.getGroupId().toString())
                .groupName(g.getParent() != null && g.getParent().getLastName() != null
                        ? g.getParent().getLastName() + " Family Group"
                        : "Group " + g.getGroupId().toString().substring(0, 8))
                .groupCode(g.getGroupId().toString().substring(0, 8).toUpperCase())
                .parentId(g.getParent() != null ? g.getParent().getUserId().toString() : "")
                .rideId(g.getRideId() != null ? g.getRideId().toString() : null)
                .children(children)
                .pickupAddress(pickup != null ? pickup.getAddress() : null)
                .pickupLatitude(pickup != null && pickup.getLatitude() != null ? pickup.getLatitude().doubleValue() : null)
                .pickupLongitude(pickup != null && pickup.getLongitude() != null ? pickup.getLongitude().doubleValue() : null)
                .dropoffAddress(dropoff != null ? dropoff.getAddress() : null)
                .dropoffLatitude(dropoff != null && dropoff.getLatitude() != null ? dropoff.getLatitude().doubleValue() : null)
                .dropoffLongitude(dropoff != null && dropoff.getLongitude() != null ? dropoff.getLongitude().doubleValue() : null)
                .build();
    }

    private ChildResponse toChildResponse(Child c, String parentId, String groupId) {
        return ChildResponse.builder()
                .id(c.getChildId() != null ? c.getChildId().toString() : "")
                .firstName(c.getFirstName() != null ? c.getFirstName() : "")
                .lastName(c.getLastName() != null ? c.getLastName() : "")
                .preferredName(c.getPreferredName() != null ? c.getPreferredName() : "")
                .grade(c.getGrade() != null ? c.getGrade().name() : null)
                .schoolName(null)
                .pronouns(c.getPronouns() != null ? c.getPronouns() : "")
                .parentId(parentId)
                .groupId(groupId)
                .build();
    }
}
