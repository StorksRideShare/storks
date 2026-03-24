package com.storks.livemessaging.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Setter
@Getter
public class ChatMessagePayload {
    private UUID messageId;
    private UUID roomId;
    private UUID senderId;
    private String content;
    private LocalDateTime sentAt;
    private com.storks.livemessaging.model.types.MessageType type = com.storks.livemessaging.model.types.MessageType.CHAT;
    
    public ChatMessagePayload() {}

}
