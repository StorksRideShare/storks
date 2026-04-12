package com.storks.booking.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.storks.booking.dto.BookingEventDTO;
import com.storks.booking.entity.Booking;
import com.storks.booking.repository.BookingRepository;
import com.storks.booking.service.BookingService;

import java.util.List;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BookingRepository bookingRepository;

    @GetMapping("/my")
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
        return bookingService.createBookingRequest(groupId, offerId);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        long count = bookingRepository.count();
        // Mock revenue calculation
        double revenue = count * 15.5; 
        return Map.of(
            "totalBookings", count,
            "totalRevenue", revenue
        );
    }

    @PutMapping("/{id}/cancel")
    public void cancelBooking(@PathVariable UUID id) {
        bookingService.cancelBooking(id);
    }
}
