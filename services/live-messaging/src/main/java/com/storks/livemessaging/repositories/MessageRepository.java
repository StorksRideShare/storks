package com.storks.livemessaging.repositories;

import com.storks.livemessaging.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    Page<Message> findByRoom_RoomIdAndIsDeletedFalseOrderBySentAtDesc(UUID roomId, Pageable pageable);
}
