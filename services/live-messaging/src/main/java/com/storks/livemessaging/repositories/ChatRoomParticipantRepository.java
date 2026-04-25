package com.storks.livemessaging.repositories;

import com.storks.models.ChatRoomParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChatRoomParticipantRepository extends JpaRepository<ChatRoomParticipant, UUID> {
    List<ChatRoomParticipant> findByUser_UserIdAndIsRemovedFalse(UUID userId);
    List<ChatRoomParticipant> findByRoom_RoomIdAndIsRemovedFalse(UUID roomId);
    List<ChatRoomParticipant> findByRoom_RoomId(UUID roomId);

    @Query("SELECT p FROM ChatRoomParticipant p WHERE p.room.roomId = :roomId AND p.user.userId = :userId")
    Optional<ChatRoomParticipant> findByRoomAndUser(@Param("roomId") UUID roomId, @Param("userId") UUID userId);

    /**
     * Find any existing DIRECT room that contains both users.
     * Returns the roomId of the first match if found.
     */
    @Query("SELECT p1.room.roomId FROM ChatRoomParticipant p1 " +
           "JOIN ChatRoomParticipant p2 ON p1.room.roomId = p2.room.roomId " +
           "WHERE p1.user.userId = :userId1 AND p2.user.userId = :userId2 " +
           "AND p1.room.chatRoomType = 'DIRECT' " +
           "AND p1.room.deleted = false")
    Optional<UUID> findExistingDirectRoom(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);

    @Query("SELECT p1.room.roomId FROM ChatRoomParticipant p1 " +
           "JOIN ChatRoomParticipant p2 ON p1.room.roomId = p2.room.roomId " +
           "WHERE p1.user.userId = :userId1 AND p2.user.userId = :userId2 " +
           "AND p1.room.chatRoomType = 'DIRECT'")
    Optional<UUID> findAnyDirectRoom(@Param("userId1") UUID userId1, @Param("userId2") UUID userId2);
}



