package com.storks.livemessaging.model;

import com.storks.livemessaging.model.types.RoomType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "chat_rooms")
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID roomId;

    @Enumerated(EnumType.STRING)
    private RoomType chatRoomType;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChatRoomParticipant> participants;

    @ManyToOne
    @JoinColumn(name = "offer_id")
    private Offer offer;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
    private boolean isDeleted = false;
}
