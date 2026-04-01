package wdse17.bookingandpayment.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import wdse17.bookingandpayment.dto.BookingEventDTO;
import wdse17.bookingandpayment.entity.Booking;
import wdse17.bookingandpayment.repository.BookingRepository;
import wdse17.bookingandpayment.service.BookingService;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/parent")
    public List<BookingEventDTO> getEventsForParent(@RequestParam(required = false) UUID parentId) {
        // Fallback to demo parent ID if not provided
        UUID effectiveParentId = (parentId != null) ? parentId : UUID.fromString("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01");
        return bookingService.getEventsForParent(effectiveParentId);
    }

    @GetMapping("/check")
    public Map<String, Object> checkBookingStatus(@RequestParam UUID groupId, @RequestParam UUID offerId) {
        List<Booking> bookings = bookingRepository.findByGroupIdAndOfferIdAndIsCancelledFalse(groupId, offerId);
        boolean exists = !bookings.isEmpty();
        boolean isActive = exists && bookings.stream().anyMatch(Booking::getIsActive);
        
        return Map.of(
            "exists", exists,
            "isActive", isActive
        );
    }

    @PostMapping("/request")
    public BookingEventDTO createBookingRequest(@RequestBody Map<String, String> payload) {
        UUID groupId = UUID.fromString(payload.get("groupId"));
        UUID offerId = UUID.fromString(payload.get("offerId"));
        String type = payload.get("type");
        return bookingService.createBookingRequest(groupId, offerId, type);
    }

    @PutMapping("/{id}/cancel")
    public void cancelBooking(@PathVariable UUID id) {
        bookingService.cancelBooking(id);
    }

    @PutMapping("/{id}/confirm-payment")
    public void confirmPayment(@PathVariable UUID id) {
        bookingService.confirmPayment(id);
    }
}
