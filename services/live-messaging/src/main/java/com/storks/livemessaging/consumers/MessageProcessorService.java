package com.storks.livemessaging.consumers;

import com.storks.livemessaging.config.KafkaConfig;
import com.storks.livemessaging.dto.ChatMessagePayload;
import com.storks.livemessaging.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MessageProcessorService {

    private static final Logger log = LoggerFactory.getLogger(MessageProcessorService.class);

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;

    @KafkaListener(topics = KafkaConfig.CHAT_MESSAGES_TOPIC, groupId = "live-messaging-group")
    public void processMessage(ChatMessagePayload payload) {
        log.info("Received message from Kafka: {}", payload.getMessageId());
        
        // 1. Save to DB and Redis
        messageService.persistAndCacheMessage(payload);
        
        // 2. Broadcast to online users in the room
        messagingTemplate.convertAndSend("/topic/room/" + payload.getRoomId(), payload);
    }
}


