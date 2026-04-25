package com.storks.livemessaging.consumers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storks.livemessaging.config.KafkaConfig;
import com.storks.livemessaging.dto.events.BookingEvent;
import com.storks.livemessaging.dto.events.OfferCreatedEvent;
import com.storks.livemessaging.service.ChatRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatEventConsumer {

    private final ChatRoomService chatRoomService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = KafkaConfig.OFFER_CREATED_TOPIC, groupId = "live-messaging-group")
    public void handleOfferCreated(String raw) {
        try {
            OfferCreatedEvent event = objectMapper.readValue(raw, OfferCreatedEvent.class);
            log.info("Received OfferCreatedEvent: offerId={}, driverId={}", event.offerId(), event.driverId());
            chatRoomService.createGroupChat(event.offerId(), event.driverId());
        } catch (Exception e) {
            log.error("Failed to deserialize OfferCreatedEvent. Raw: {}", raw, e);
        }
    }

    @KafkaListener(topics = KafkaConfig.BOOKING_CREATED_TOPIC, groupId = "live-messaging-group")
    public void handleBookingCreated(String raw) {
        try {
            BookingEvent event = objectMapper.readValue(raw, BookingEvent.class);
            log.info("Received BookingCreatedEvent: offerId={}, parentId={}", event.offerId(), event.parentId());
            chatRoomService.addParticipantToOfferGroup(event.offerId(), event.parentId());
        } catch (Exception e) {
            log.error("Failed to deserialize BookingEvent (created). Raw: {}", raw, e);
        }
    }

    @KafkaListener(topics = KafkaConfig.BOOKING_CANCELLED_TOPIC, groupId = "live-messaging-group")
    public void handleBookingCancelled(String raw) {
        try {
            BookingEvent event = objectMapper.readValue(raw, BookingEvent.class);
            log.info("Received BookingCancelledEvent: offerId={}, parentId={}", event.offerId(), event.parentId());
            chatRoomService.removeParticipantFromOfferGroup(event.offerId(), event.parentId());
        } catch (Exception e) {
            log.error("Failed to deserialize BookingEvent (cancelled). Raw: {}", raw, e);
        }
    }
}


