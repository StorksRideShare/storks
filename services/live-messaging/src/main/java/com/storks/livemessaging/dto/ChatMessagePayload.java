package com.storks.livemessaging.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

public class ChatMessagePayload {
    private UUID messageId;
    private UUID roomId;
    private UUID senderId;
    private String content;
    private LocalDateTime sentAt;
    
    public ChatMessagePayload() {}
    
    public UUID getMessageId() { return messageId; }
    public void setMessageId(UUID messageId) { this.messageId = messageId; }
    
    public UUID getRoomId() { return roomId; }
    public void setRoomId(UUID roomId) { this.roomId = roomId; }
    
    public UUID getSenderId() { return senderId; }
    public void setSenderId(UUID senderId) { this.senderId = senderId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
}
