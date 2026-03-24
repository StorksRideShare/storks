package com.storks.livemessaging.model;

import com.storks.livemessaging.model.types.MessageType;
import com.storks.livemessaging.model.types.RoomType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;
import java.security.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Entity
@Getter
@Setter
@Table(name = "messages")
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID messageId;

    @ManyToOne
    @JoinColumn(name = "room_id")
    private ChatRoom room;

    private LocalDateTime sentAt;

    @Enumerated(EnumType.STRING)
    private MessageType type = MessageType.CHAT;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    private String content;

    @ManyToMany
    @JoinTable(
            name = "message_read_by",
            joinColumns = @JoinColumn(name = "message_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> readBy;

    private boolean isDeleted;
    private LocalDateTime deletedAt;
}

