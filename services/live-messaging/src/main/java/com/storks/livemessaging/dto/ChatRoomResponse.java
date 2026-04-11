package com.storks.livemessaging.dto;

import com.storks.models.types.RoomType;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ChatRoomResponse(
        UUID roomId,
        RoomType chatRoomType,
        List<ParticipantResponse> participants,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        String lastMessageContent,
        OffsetDateTime lastMessageSentAt
) {}


