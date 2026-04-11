package com.storks.livemessaging.consumers;

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

    @KafkaListener(topics = KafkaConfig.OFFER_CREATED_TOPIC, groupId = "live-messaging-group")
    public void handleOfferCreated(OfferCreatedEvent event) {
        log.info("Received OfferCreatedEvent: offerId={}, driverId={}", event.offerId(), event.driverId());
        chatRoomService.createGroupChat(event.offerId(), event.driverId());
    }

    @KafkaListener(topics = KafkaConfig.BOOKING_CREATED_TOPIC, groupId = "live-messaging-group")
    public void handleBookingCreated(BookingEvent event) {
        log.info("Received BookingCreatedEvent: offerId={}, parentId={}", event.offerId(), event.parentId());
        chatRoomService.addParticipantToOfferGroup(event.offerId(), event.parentId());
    }

    @KafkaListener(topics = KafkaConfig.BOOKING_CANCELLED_TOPIC, groupId = "live-messaging-group")
    public void handleBookingCancelled(BookingEvent event) {
        log.info("Received BookingCancelledEvent: offerId={}, parentId={}", event.offerId(), event.parentId());
        chatRoomService.removeParticipantFromOfferGroup(event.offerId(), event.parentId());
    }
}


