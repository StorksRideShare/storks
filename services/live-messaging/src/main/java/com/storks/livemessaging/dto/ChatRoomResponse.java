package com.storks.livemessaging.dto;

import com.storks.livemessaging.model.types.RoomType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ChatRoomResponse(
        UUID roomId,
        RoomType chatRoomType,
        List<ParticipantResponse> participants,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
