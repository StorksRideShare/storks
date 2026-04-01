package wdse17.bookingandpayment.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import wdse17.bookingandpayment.dto.BookingEventDTO;
import wdse17.bookingandpayment.entity.Booking;
import wdse17.bookingandpayment.entity.ChildGroup;
import wdse17.bookingandpayment.entity.Offer;
import wdse17.bookingandpayment.repository.BookingRepository;
import wdse17.bookingandpayment.repository.ChildGroupRepository;
import wdse17.bookingandpayment.repository.OfferRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    @Autowired
    private ChildGroupService childGroupService;

    private static final double PRICE_PER_KM_MONTHLY = 80.00;
    private static final double PRICE_PER_KM_DAY = 110.00;

    public List<BookingEventDTO> getEventsForParent(UUID parentId) {
        return bookingRepository.findByParentId(parentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public boolean isGroupBooked(UUID groupId, UUID offerId) {
        return bookingRepository.existsActiveOrPendingBooking(groupId, offerId);
    }

    public void confirmPayment(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setIsActive(true);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    public void cancelBooking(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        booking.setIsCancelled(true);
        booking.setIsActive(false);
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    public BookingEventDTO createBookingRequest(UUID groupId, UUID offerId, String type, String startDateStr) {
        // Validation: Cannot have duplicate active/inactive bookings for same driver and group
        // REMOVED AT USER REQUEST: Allowed to force book multiple times
        // if (bookingRepository.existsActiveOrPendingBooking(groupId, offerId)) {
        //    throw new RuntimeException("You already have a pending or active request with this driver for this group.");
        // }

        ChildGroup group = childGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        Offer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offer not found"));

        // Price calculation
        double price = 0;
        int childrenCount = group.getChildren().size();
        if (offer.getIsUsingIntelligentPricing()) {
            Double distanceKm = childGroupService.getChildGroupsByParent(group.getParentId())
                    .stream()
                    .filter(g -> g.getGroupId().equals(groupId))
                    .findFirst()
                    .map(g -> g.getDistanceKm())
                    .orElse(4.5);
            
            double rate = "MONTHLY".equalsIgnoreCase(type) ? PRICE_PER_KM_MONTHLY : PRICE_PER_KM_DAY;
            price = distanceKm * rate * childrenCount;
            if ("MONTHLY".equalsIgnoreCase(type)) {
                price *= 30; // Scale for 30 days
            }
        } else {
            double rate = "MONTHLY".equalsIgnoreCase(type) ? offer.getPricePerMonth() : offer.getPricePerDay();
            price = rate * childrenCount;
        }

        // Date handling
        LocalDate startDate = LocalDate.parse(startDateStr);
        LocalDate endDate = "MONTHLY".equalsIgnoreCase(type) ? startDate.plusDays(30) : startDate;

        // Compliance with database_setup.sql - Only use Booking table
        Booking booking = Booking.builder()
                .id(UUID.randomUUID())
                .parentId(group.getParentId())
                .offer(offer)
                .childGroup(group)
                .type(type)
                .price(price)
                .startDate(startDate)
                .endDate(endDate)
                .isActive(false)
                .isCancelled(false)
                .isAccepted(false)
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
        } else if (Boolean.TRUE.equals(booking.getIsAccepted())) {
            status = "Accepted";
        }

        String title = "Booking Requested";
        String description = "Your request for Group: " + autoGroupName + " has been sent to " + driverName + ".";
        
        if ("Confirmed".equalsIgnoreCase(status)) {
            title = "Payment Confirmed";
            description = driverName + " will pick up " + autoGroupName + " tomorrow. If their schedule needs to be changed, please adjust it before 9:PM";
        } else if ("Accepted".equalsIgnoreCase(status)) {
            title = "Request Accepted";
            description = driverName + " has accepted your offer, Pay him to finalize the booking.";
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
                .date(booking.getStartDate() != null ? booking.getStartDate().toString() : "Tomorrow")
                .time("07:30 AM")
                .location(group.getDefaultDropoffLocation() != null ? 
                        (group.getDefaultDropoffLocation().getNickname() != null ? 
                         group.getDefaultDropoffLocation().getNickname() : group.getDefaultDropoffLocation().getAddress()) : "Assigned School")
                .offerId(offer.getOfferId())
                .groupId(group.getGroupId())
                .price(booking.getPrice())
                .type(booking.getType())
                .build();
    }
}
