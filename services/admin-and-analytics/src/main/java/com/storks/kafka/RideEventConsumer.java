package com.storks.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.storks.dto.RideEvent;
import com.storks.service.MetricsService;

@Component
public class RideEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(RideEventConsumer.class);

    private final MetricsService metricsService;

    public RideEventConsumer(MetricsService metricsService) {
        this.metricsService = metricsService;
    }

    @KafkaListener(
        topics = "${kafka.topics.ride-events:ride-events}",   // fallback topic name
        groupId = "admin-metrics-group",
        containerFactory = "kafkaListenerContainerFactory"    // default if not custom
    )
    public void consumeRideEvent(RideEvent event) {
        log.info("Received ride event: rideId={}, status={}", event.getRideId(), event.getStatus());
        metricsService.handleRideEvent(event);
    }

}