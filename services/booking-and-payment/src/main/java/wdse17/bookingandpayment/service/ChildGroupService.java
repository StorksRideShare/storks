package wdse17.bookingandpayment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import wdse17.bookingandpayment.dto.ChildDTO;
import wdse17.bookingandpayment.dto.ChildGroupDTO;
import wdse17.bookingandpayment.entity.ChildGroup;
import wdse17.bookingandpayment.repository.ChildGroupRepository;

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

        Double distanceKm = calculateDistance(group.getPickupLocation(), group.getDefaultDropoffLocation());

        return ChildGroupDTO.builder()
                .groupId(group.getGroupId())
                .groupName(groupName)
                .children(children)
                .defaultDropLocation(dropLocation)
                .distanceKm(distanceKm)
                .build();
    }

    private Double calculateDistance(wdse17.bookingandpayment.entity.Location loc1, wdse17.bookingandpayment.entity.Location loc2) {
        if (loc1 == null || loc2 == null || loc1.getLatitude() == null || loc1.getLongitude() == null || loc2.getLatitude() == null || loc2.getLongitude() == null) {
            return 4.5; // fallback average distance
        }

        double lat1 = loc1.getLatitude().doubleValue();
        double lon1 = loc1.getLongitude().doubleValue();
        double lat2 = loc2.getLatitude().doubleValue();
        double lon2 = loc2.getLongitude().doubleValue();

        double earthRadius = 6371; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return (double) Math.round(earthRadius * c * 10) / 10.0;
    }
}
