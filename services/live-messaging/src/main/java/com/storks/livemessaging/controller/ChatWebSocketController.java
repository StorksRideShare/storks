package com.storks.livemessaging.controller;

import com.storks.livemessaging.dto.ChatMessagePayload;
import com.storks.models.dto.UserAuthClaim;
import com.storks.livemessaging.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final MessageService messageService;

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessagePayload chatMessage, Principal principal) {
        if (principal instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof UserAuthClaim claim) {
                UUID senderId = claim.userId();
                chatMessage.setSenderId(senderId);
                
                if (chatMessage.getType() == com.storks.models.types.MessageType.READ_RECEIPT) {
                    messageService.markMessageAsRead(chatMessage.getMessageId(), senderId);
                }
                
                // Publish to Kafka queue (Kafka consumer will broadcast it)
                messageService.publishMessageToKafka(chatMessage);
                return;
            }
        }
        log.warn("Unauthorized message attempt over WebSocket");
    }
}


