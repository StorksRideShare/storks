package com.storks.livemessaging.model;

import com.storks.livemessaging.model.types.MessageType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Persistable;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;


@Entity
@Getter
@Setter
@Table(name = "messages")
public class Message implements Persistable<UUID> {
    @Id
    private UUID messageId;

    @Transient
    private boolean isNew = true;

    @Override
    public UUID getId() {
        return messageId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }

    @ManyToOne
    @JoinColumn(name = "room_id")
    private ChatRoom room;

    private OffsetDateTime sentAt;

    @Enumerated(EnumType.STRING)
    private MessageType type = MessageType.CHAT;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    private User sender;

    private String content;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "message_read_by",
            joinColumns = @JoinColumn(name = "message_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> readBy;

    private boolean isDeleted;
    private OffsetDateTime deletedAt;
}

