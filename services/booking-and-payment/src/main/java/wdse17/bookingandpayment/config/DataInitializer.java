package wdse17.bookingandpayment.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import wdse17.bookingandpayment.entity.Booking;
import wdse17.bookingandpayment.entity.ChildGroup;
import wdse17.bookingandpayment.repository.BookingRepository;
import wdse17.bookingandpayment.repository.ChildGroupRepository;
import wdse17.bookingandpayment.repository.OfferRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ChildGroupRepository childGroupRepository;

    @Autowired
    private OfferRepository offerRepository;

    @Override
    public void run(String... args) throws Exception {
        UUID parentId = UUID.fromString("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01");
        List<ChildGroup> groups = childGroupRepository.findByParentId(parentId);
        
        if (groups.isEmpty()) return;

        // Only using Booking table as per requirements
        if (bookingRepository.count() == 0) {
            var offer = offerRepository.findAll().stream()
                    .filter(o -> o.getDriver().getUser().getFirstName().equalsIgnoreCase("Ranidu"))
                    .findFirst()
                    .orElse(null);

            if (offer != null) {
                // First: Payment Confirmed (Active)
                Booking booking1 = Booking.builder()
                        .id(UUID.randomUUID())
                        .parentId(parentId)
                        .childGroup(groups.get(0))
                        .offer(offer)
                        .type("MONTH")
                        .isActive(true)
                        .isCancelled(false)
                        .createdAt(LocalDateTime.now())
                        .build();
                bookingRepository.save(booking1);

                // Second: New Waiting Request (Inactive, no type)
                if (groups.size() > 1) {
                    Booking booking2 = Booking.builder()
                            .id(UUID.randomUUID())
                            .parentId(parentId)
                            .childGroup(groups.get(1))
                            .offer(offer)
                            .type(null)
                            .isActive(false)
                            .isCancelled(false)
                            .createdAt(LocalDateTime.now())
                            .build();
                    bookingRepository.save(booking2);
                }
            }
        }
    }
}
