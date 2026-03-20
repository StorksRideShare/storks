package com.storks.livemessaging.consumers;

import com.storks.livemessaging.dto.PingMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class PingConsumer {

    private static final Logger log = LoggerFactory.getLogger(PingConsumer.class);

    @KafkaListener(topics = "ping-topic", groupId = "ping-pong-group")
    public void handlePingMessage(PingMessage pingMessage) {
        log.info("Received PingMessage from topic: {}", pingMessage.toString());
    }
}
