package com.storks.livemessaging.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;
import java.util.List;

@Setter
@Getter
public class ChatMessagePayload {
    private UUID messageId;
    private UUID roomId;
    private UUID senderId;
    private String content;
    private OffsetDateTime sentAt;
    private com.storks.livemessaging.model.types.MessageType type = com.storks.livemessaging.model.types.MessageType.CHAT;
    private List<UUID> readBy;
    
    public ChatMessagePayload() {}

}
