package com.storks.livemessaging.service;

import com.storks.livemessaging.model.ChatRoom;
import com.storks.livemessaging.model.ChatRoomParticipant;
import com.storks.livemessaging.repositories.ChatRoomParticipantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    
    private final ChatRoomParticipantRepository chatRoomParticipantRepository;

    public List<ChatRoom> getUserActiveRooms(UUID userId) {
        List<ChatRoomParticipant> participants = chatRoomParticipantRepository.findByUser_UserIdAndIsRemovedFalse(userId);
        return participants.stream()
                .map(ChatRoomParticipant::getRoom)
                .filter(room -> !room.isDeleted())
                .collect(Collectors.toList());
    }
}
