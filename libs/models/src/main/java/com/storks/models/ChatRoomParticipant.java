package com.storks.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "chat_room_participants")
public class ChatRoomParticipant {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private ChatRoom room;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private OffsetDateTime joinedAt = OffsetDateTime.now();

    private Boolean isRemoved = false;
    
    public ChatRoomParticipant() {}
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    
    public ChatRoom getRoom() { return room; }
    public void setRoom(ChatRoom room) { this.room = room; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    
    public OffsetDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(OffsetDateTime joinedAt) { this.joinedAt = joinedAt; }
    
    public Boolean isRemoved() { return isRemoved; }
    public void setRemoved(Boolean isRemoved) { this.isRemoved = isRemoved; }
}
