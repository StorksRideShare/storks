package com.storks.livemessaging.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.storks.models.types.RoomType;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record ChatRoomResponse(
        @JsonProperty("roomId") UUID roomId,
        @JsonProperty("chatRoomType") RoomType chatRoomType,
        @JsonProperty("participants") List<ParticipantResponse> participants,
        @JsonProperty("createdAt") OffsetDateTime createdAt,
        @JsonProperty("updatedAt") OffsetDateTime updatedAt,
        @JsonProperty("lastMessageContent") String lastMessageContent,
        @JsonProperty("lastMessageSentAt") OffsetDateTime lastMessageSentAt
) {}


