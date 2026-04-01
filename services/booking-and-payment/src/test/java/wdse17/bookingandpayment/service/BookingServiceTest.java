package wdse17.bookingandpayment.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import wdse17.bookingandpayment.entity.Booking;
import wdse17.bookingandpayment.entity.ChildGroup;
import wdse17.bookingandpayment.entity.Offer;
import wdse17.bookingandpayment.repository.BookingRepository;
import wdse17.bookingandpayment.repository.ChildGroupRepository;
import wdse17.bookingandpayment.repository.OfferRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ChildGroupRepository childGroupRepository;

    @Mock
    private OfferRepository offerRepository;

    @InjectMocks
    private BookingService bookingService;

    private UUID groupId;
    private UUID offerId;
    private UUID bookingId;

    @BeforeEach
    void setUp() {
        groupId = UUID.randomUUID();
        offerId = UUID.randomUUID();
        bookingId = UUID.randomUUID();
    }

    @Test
    void testCancelBooking_Success() {
        // Arrange (Setup a valid, existing booking)
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setIsActive(true);
        booking.setIsCancelled(false);

        // Tell mockito to return this booking when the repository is queried
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // Let the save method return whatever was passed to it
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArguments()[0]);

        // Act (Execute the cancel action)
        bookingService.cancelBooking(bookingId);

        // Assert (Ensure the booking state was updated properly)
        assertTrue(booking.getIsCancelled(), "Booking should be marked as cancelled");
        assertFalse(booking.getIsActive(), "Booking should be marked as inactive after cancellation");
    }

    @Test
    void testCancelBooking_FailsWhenBookingNotFound() {
        // Arrange (Simulate database returning nothing)
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        // Act & Assert (Should throw our specific validation error)
        Exception exception = assertThrows(RuntimeException.class, () -> {
            bookingService.cancelBooking(bookingId);
        });

        // Verify the message confirms the exact problem to the developer/frontend
        assertTrue(exception.getMessage().contains("Cannot cancel a booking that does not exist"));
    }

    @Test
    void testCreateBookingRequest_FailsWhenDateIsInPast() {
        // Arrange (Provide valid child group and offer to bypass initial checks)
        when(childGroupRepository.findById(groupId)).thenReturn(Optional.of(new ChildGroup()));
        when(offerRepository.findById(offerId)).thenReturn(Optional.of(new Offer()));

        // Create a date that explicitly violates the rules
        String pastDate = LocalDate.now().minusDays(1).toString();

        // Act & Assert (Verify the past dates throw our validation error)
        Exception exception = assertThrows(RuntimeException.class, () -> {
            bookingService.createBookingRequest(groupId, offerId, "DAY", pastDate);
        });

        assertTrue(exception.getMessage().contains("You cannot book a date that has already passed"));
    }
}
