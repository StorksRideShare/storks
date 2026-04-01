package com.storks.booking.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.storks.booking.dto.BookingEventDTO;
import com.storks.booking.entity.Booking;
import com.storks.booking.entity.ChildGroup;
import com.storks.booking.entity.Offer;
import com.storks.booking.repository.BookingRepository;
import com.storks.booking.repository.ChildGroupRepository;
import com.storks.booking.repository.OfferRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {

    @Autowired
    private ChildGroupRepository childGroupRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private OfferRepository offerRepository;

    public List<BookingEventDTO> getEventsForParent(UUID parentId) {
        return bookingRepository.findByParentId(parentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public boolean isGroupBooked(UUID groupId, UUID offerId) {
        return bookingRepository.existsActiveOrPendingBooking(groupId, offerId);
    }

    public void cancelBooking(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setIsCancelled(true);
        booking.setIsActive(false);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    public BookingEventDTO createBookingRequest(UUID groupId, UUID offerId) {
        // Validation: Cannot have duplicate active/inactive bookings for same driver and group
        if (bookingRepository.existsActiveOrPendingBooking(groupId, offerId)) {
            throw new RuntimeException("You already have a pending or active request with this driver for this group.");
        }

        ChildGroup group = childGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        // Compliance with database_setup.sql - Only use Booking table
        Booking booking = Booking.builder()
                .id(UUID.randomUUID())
                .parentId(group.getParentId())
                .offer(offer)
                .childGroup(group)
                .type(null)
                .isActive(false)
                .isCancelled(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        booking = bookingRepository.save(booking);

        return mapToDTO(booking);
    }

    private BookingEventDTO mapToDTO(Booking booking) {
        Offer offer = booking.getOffer();
        ChildGroup group = booking.getChildGroup();
        String driverName = offer.getDriver().getUser().getFirstName() + " " + offer.getDriver().getUser().getLastName();
        
        String autoGroupName = group.getChildren().stream()
                .filter(c -> c != null)
                .map(child -> child.getPreferredName() != null ? child.getPreferredName() : child.getFirstName())
                .collect(Collectors.joining(", "));

        // Status derivation based ONLY on Booking table
        String status = "Requested";
        if (Boolean.TRUE.equals(booking.getIsActive())) {
            status = "Confirmed";
        } else if (Boolean.TRUE.equals(booking.getIsCancelled())) {
            status = "Cancelled";
        } 

        String title = "Booking Requested";
        String description = "Your request for Group: " + autoGroupName + " has been sent to " + driverName + ".";
        
        if ("Confirmed".equalsIgnoreCase(status)) {
            title = "Payment Confirmed";
            description = driverName + " will pick up " + autoGroupName + " tomorrow. If their schedule needs to be changed, please adjust it before 9:PM";
        }

        return BookingEventDTO.builder()
                .id(booking.getId())
                .groupName(autoGroupName)
                .driverName(driverName)
                .vehicle(offer.getVehicle() != null ? offer.getVehicle().getNickname() : "Unknown Vehicle")
                .plate(offer.getVehicle() != null ? offer.getVehicle().getLicensePlate() : "N/A")
                .status(status)
                .title(title)
                .description(description)
                .date("Tomorrow")
                .time("07:30 AM")
                .location(group.getDefaultDropoffLocation() != null ? 
                        (group.getDefaultDropoffLocation().getNickname() != null ? 
                         group.getDefaultDropoffLocation().getNickname() : group.getDefaultDropoffLocation().getAddress()) : "Assigned School")
                .build();
    }
}
