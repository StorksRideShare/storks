package com.storks.livemessaging.controller;

import com.storks.livemessaging.model.Message;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatController {

    @Autowired
    private KafkaTemplate<String, Message> kafkaTemplate;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private RedisService redisService;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public") // For public broadcasts (optional)
    public void sendMessage(Message message) {
        // 1. Publish to Kafka for asynchronous persistence
        kafkaTemplate.send("chat-messages", message);

        // 2. Check if recipient is online via Redis
        String recipientId = message.getRecipientId().toString();
        boolean isOnline = redisService.isUserOnline(recipientId);

        // 3. If online, deliver immediately via WebSocket
        if (isOnline) {
            messagingTemplate.convertAndSendToUser(
                    recipientId,
                    "/queue/messages",
                    message
            );
        } else {
            // Store in Redis for offline delivery later
            redisService.storeOfflineMessage(recipientId, message);
        }
    }

    @MessageMapping("/chat.typing")
    public <TypingIndicator> void typingIndicator(TypingIndicator indicator) {
        // Send typing notifications to the relevant user/conversation
        messagingTemplate.convertAndSendToUser(
                indicator.getRecipientId().toString(),
                "/queue/typing",
                indicator
        );
    }
}