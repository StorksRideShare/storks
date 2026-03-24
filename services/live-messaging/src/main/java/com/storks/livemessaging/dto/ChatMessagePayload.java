package com.storks.livemessaging.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;

@Setter
@Getter
public class ChatMessagePayload {
    private UUID messageId;
    private UUID roomId;
    private UUID senderId;
    private String content;
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime sentAt;
    private com.storks.livemessaging.model.types.MessageType type = com.storks.livemessaging.model.types.MessageType.CHAT;
    
    public ChatMessagePayload() {}

}
