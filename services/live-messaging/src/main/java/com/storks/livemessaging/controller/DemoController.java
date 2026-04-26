package com.storks.livemessaging.controller;

import com.storks.livemessaging.config.KafkaConfig;
import com.storks.livemessaging.dto.events.BookingEvent;
import com.storks.livemessaging.dto.events.OfferCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/demo")
@RequiredArgsConstructor
@Slf4j
public class DemoController {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final com.storks.livemessaging.repositories.ChildGroupRepository childGroupRepository;

    @org.springframework.web.bind.annotation.GetMapping("/verification-contexts")
    public ResponseEntity<java.util.List<com.storks.livemessaging.dto.VerificationDemoContext>> getVerificationContexts(@org.springframework.security.core.annotation.AuthenticationPrincipal com.storks.models.dto.UserAuthClaim claim) {
        log.info("Demo: getVerificationContexts for user {}", claim != null ? claim.userId() : "NULL");
        if (claim == null || claim.userId() == null) {
            return ResponseEntity.status(401).build();
        }

        java.util.List<com.storks.models.ChildGroup> groups = childGroupRepository.findByParent_UserId(claim.userId());
        
        java.util.List<com.storks.livemessaging.dto.VerificationDemoContext> contexts = groups.stream()
            .flatMap(group -> group.getChildren().stream()
                .map(child -> new com.storks.livemessaging.dto.VerificationDemoContext(
                    group.getGroupId(),
                    group.getRideId(),
                    child.getChildId(),
                    child.getFirstName() + " " + child.getLastName()
                )))
            .collect(java.util.stream.Collectors.toList());

        log.info("Demo: Found {} verification contexts", contexts.size());
        return ResponseEntity.ok(contexts);
    }

    @PostMapping("/offer-created")
    public ResponseEntity<String> triggerOfferCreated(@RequestBody Map<String, String> payload) {
        log.info("Demo: triggerOfferCreated {}", payload);
        UUID offerId = UUID.fromString(payload.get("offerId"));
        UUID driverId = UUID.fromString(payload.get("driverId"));
        
        OfferCreatedEvent event = new OfferCreatedEvent(offerId, driverId);
        kafkaTemplate.send(KafkaConfig.OFFER_CREATED_TOPIC, event);
        
        return ResponseEntity.ok("Offer created event sent");
    }

    @PostMapping("/booking-created")
    public ResponseEntity<String> triggerBookingCreated(@RequestBody Map<String, String> payload) {
        log.info("Demo: triggerBookingCreated {}", payload);
        UUID offerId = UUID.fromString(payload.get("offerId"));
        UUID parentId = UUID.fromString(payload.get("parentId"));
        
        BookingEvent event = new BookingEvent(offerId, parentId);
        kafkaTemplate.send(KafkaConfig.BOOKING_CREATED_TOPIC, event);
        
        return ResponseEntity.ok("Booking created event sent");
    }

    @PostMapping("/booking-cancelled")
    public ResponseEntity<String> triggerBookingCancelled(@RequestBody Map<String, String> payload) {
        log.info("Demo: triggerBookingCancelled {}", payload);
        UUID offerId = UUID.fromString(payload.get("offerId"));
        UUID parentId = UUID.fromString(payload.get("parentId"));
        
        BookingEvent event = new BookingEvent(offerId, parentId);
        kafkaTemplate.send(KafkaConfig.BOOKING_CANCELLED_TOPIC, event);
        
        return ResponseEntity.ok("Booking cancelled event sent");
    }
}
