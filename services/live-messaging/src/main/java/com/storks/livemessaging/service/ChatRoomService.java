package com.storks.livemessaging.service;

import com.storks.livemessaging.dto.ChatRoomResponse;
import com.storks.livemessaging.dto.ParticipantResponse;
import com.storks.models.ChatRoom;
import com.storks.models.ChatRoomParticipant;
import com.storks.models.User;
import com.storks.models.types.RoomType;
import com.storks.livemessaging.repositories.ChatRoomParticipantRepository;
import com.storks.livemessaging.repositories.ChatRoomRepository;
import com.storks.livemessaging.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatRoomService {
    
    private final ChatRoomParticipantRepository chatRoomParticipantRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final com.storks.livemessaging.repositories.MessageRepository messageRepository;

    public List<ChatRoom> getUserActiveRooms(UUID userId) {
        List<ChatRoomParticipant> participants = chatRoomParticipantRepository.findByUser_UserIdAndIsRemovedFalse(userId);
        return participants.stream()
                .map(ChatRoomParticipant::getRoom)
                .filter(room -> !room.isDeleted())
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatRoom createOrRestoreDirectRoom(UUID initiatorId, UUID targetId) {
        if (initiatorId.equals(targetId)) {
            throw new IllegalArgumentException("Cannot create a chat with yourself");
        }

        // Check if ANY direct room exists (even deleted)
        return chatRoomParticipantRepository.findAnyDirectRoom(initiatorId, targetId)
                .map(roomId -> {
                    ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();
                    if (room.isDeleted()) {
                        room.setDeleted(false);
                        room.setUpdatedAt(OffsetDateTime.now());
                        chatRoomRepository.save(room);
                    }
                    // Ensure participants are marked as not removed
                    List<ChatRoomParticipant> participants = chatRoomParticipantRepository.findByRoom_RoomId(roomId);
                    for (ChatRoomParticipant p : participants) {
                        if (p.isRemoved()) {
                            p.setRemoved(false);
                            chatRoomParticipantRepository.save(p);
                        }
                    }
                    return room;
                })
                .orElseGet(() -> {
                    // Create new room
                    ChatRoom room = new ChatRoom();
                    room.setChatRoomType(RoomType.DIRECT);
                    room.setCreatedAt(OffsetDateTime.now());
                    room.setUpdatedAt(OffsetDateTime.now());
                    room = chatRoomRepository.save(room);

                    User initiator = userRepository.findById(initiatorId).orElseThrow();
                    User target = userRepository.findById(targetId).orElseThrow();

                    createParticipant(room, initiator);
                    createParticipant(room, target);

                    return room;
                });
    }

    private void createParticipant(ChatRoom room, User user) {
        ChatRoomParticipant participant = new ChatRoomParticipant();
        participant.setRoom(room);
        participant.setUser(user);
        participant.setJoinedAt(OffsetDateTime.now());
        participant.setRemoved(false);
        chatRoomParticipantRepository.save(participant);
    }

    @Transactional
    public ChatRoom createGroupChat(UUID offerId, UUID driverId) {
        return chatRoomRepository.findByOffer_OfferId(offerId)
                .orElseGet(() -> {
                    ChatRoom room = new ChatRoom();
                    room.setChatRoomType(RoomType.GROUP);
                    room.setCreatedAt(OffsetDateTime.now());
                    room.setUpdatedAt(OffsetDateTime.now());
                    
                    com.storks.models.Offer offer = new com.storks.models.Offer();
                    offer.setOfferId(offerId);
                    room.setOffer(offer);
                    
                    room = chatRoomRepository.save(room);

                    User driver = userRepository.findById(driverId).orElseThrow();
                    createParticipant(room, driver);

                    return room;
                });
    }

    @Transactional
    public void addParticipantToOfferGroup(UUID offerId, UUID userId) {
        ChatRoom room = chatRoomRepository.findByOffer_OfferId(offerId)
                .orElseThrow(() -> new IllegalArgumentException("No chat room found for offer: " + offerId));
        
        User user = userRepository.findById(userId).orElseThrow();
        
        chatRoomParticipantRepository.findByRoomAndUser(room.getRoomId(), userId)
                .ifPresentOrElse(
                        p -> {
                            if (p.isRemoved()) {
                                p.setRemoved(false);
                                chatRoomParticipantRepository.save(p);
                            }
                        },
                        () -> createParticipant(room, user)
                );
    }

    @Transactional
    public void removeParticipantFromOfferGroup(UUID offerId, UUID userId) {
        ChatRoom room = chatRoomRepository.findByOffer_OfferId(offerId)
                .orElseThrow(() -> new IllegalArgumentException("No chat room found for offer: " + offerId));
        
        chatRoomParticipantRepository.findByRoomAndUser(room.getRoomId(), userId)
                .ifPresent(p -> {
                    p.setRemoved(true);
                    chatRoomParticipantRepository.save(p);
                });
    }

    public ChatRoomResponse toResponse(ChatRoom room) {
        List<ChatRoomParticipant> participants = chatRoomParticipantRepository.findByRoom_RoomId(room.getRoomId());
        
        List<ParticipantResponse> participantDTOs = participants.stream()
                .map(p -> new ParticipantResponse(
                        p.getUser().getUserId(),
                        p.getUser().getProviderUserId(),
                        p.getUser().getFirstName(),
                        p.getUser().getLastName(),
                        p.getUser().getEmail(),
                        p.getUser().getRole(),
                        p.isRemoved()
                ))
                .collect(Collectors.toList());

        String roomName = null;
        if (room.getChatRoomType() == RoomType.GROUP && room.getOffer() != null) {
            // Find driver
            roomName = participants.stream()
                    .filter(p -> p.getUser().getRole() == com.storks.models.types.RoleType.DRIVER)
                    .findFirst()
                    .map(p -> p.getUser().getFirstName() + "'s parents")
                    .orElse("Group Chat");
        }

        String lastMessageContent = null;
        OffsetDateTime lastMessageSentAt = null;

        org.springframework.data.domain.Page<com.storks.models.Message> lastMessagePage = 
            messageRepository.findByRoom_RoomIdAndDeletedFalseOrderBySentAtDesc(
                room.getRoomId(), 
                org.springframework.data.domain.PageRequest.of(0, 1)
            );

        if (!lastMessagePage.isEmpty()) {
            com.storks.models.Message lastMessage = lastMessagePage.getContent().get(0);
            lastMessageContent = lastMessage.getContent();
            lastMessageSentAt = lastMessage.getSentAt();
        }

        return new ChatRoomResponse(
                room.getRoomId(),
                room.getChatRoomType(),
                participantDTOs,
                room.getCreatedAt(),
                room.getUpdatedAt(),
                lastMessageContent,
                lastMessageSentAt
        );
    }

    public ChatRoomResponse getRoomDetail(UUID roomId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        return toResponse(room);
    }
}



