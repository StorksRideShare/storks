package com.storks.livemessaging.repositories;

import com.storks.livemessaging.model.ChatRoomParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatRoomParticipantRepository extends JpaRepository<ChatRoomParticipant, UUID> {
    List<ChatRoomParticipant> findByUser_UserIdAndIsRemovedFalse(UUID userId);
    List<ChatRoomParticipant> findByRoom_RoomIdAndIsRemovedFalse(UUID roomId);
}
