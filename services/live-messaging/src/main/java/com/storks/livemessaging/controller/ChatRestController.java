package com.storks.livemessaging.controller;

import com.storks.models.dto.UserAuthClaim;
import com.storks.models.ChatRoom;
import com.storks.models.Message;
import com.storks.livemessaging.repositories.UserRepository;
import com.storks.livemessaging.service.ChatRoomService;
import com.storks.livemessaging.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/chats")
@RequiredArgsConstructor
public class ChatRestController {

    private static final Logger log = LoggerFactory.getLogger(ChatRestController.class);

    private final ChatRoomService chatRoomService;
    private final MessageService messageService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<com.storks.livemessaging.dto.ChatRoomResponse>> getUserChats(@AuthenticationPrincipal UserAuthClaim claim) {
        log.info("REST: getUserChats - Claim: {}", claim != null ? claim.userId() : "NULL");
        if (claim == null || claim.userId() == null) {
            log.warn("REST: getUserChats - Returning 401 due to null claim");
            return ResponseEntity.status(401).build();
        }

        List<com.storks.livemessaging.dto.ChatRoomResponse> rooms = chatRoomService.getUserActiveRooms(claim.userId())
                .stream()
                .map(chatRoomService::toResponse)
                .collect(java.util.stream.Collectors.toList());
        log.info("REST: getUserChats - Found {} rooms", rooms.size());
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<Page<com.storks.livemessaging.dto.ChatMessagePayload>> getRoomMessages(
            @PathVariable UUID roomId,
            @PageableDefault(size = 50, sort = "sentAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserAuthClaim claim) {
        log.info("REST: getRoomMessages - Room: {} | Claim: {}", roomId, claim != null ? claim.userId() : "NULL");
        if (claim == null || claim.userId() == null) return ResponseEntity.status(401).build();
        
        Page<com.storks.livemessaging.dto.ChatMessagePayload> messages = messageService.getMessageHistory(roomId, pageable);
        return ResponseEntity.ok(messages);
    }

    @PostMapping
    public ResponseEntity<com.storks.livemessaging.dto.ChatRoomResponse> createChat(@RequestBody com.storks.livemessaging.dto.CreateChatRequest request, @AuthenticationPrincipal UserAuthClaim claim) {
        if (claim == null || claim.userId() == null) return ResponseEntity.status(401).build();
        
        UUID targetId;
        try {
            targetId = UUID.fromString(request.getTargetUserId());
        } catch (IllegalArgumentException e) {
            // Find by email or provider id
            List<com.storks.models.User> candidates = userRepository.searchByEmailOrId(request.getTargetUserId());
            if (candidates.isEmpty()) {
                throw new IllegalArgumentException("User not found: " + request.getTargetUserId());
            }
            targetId = candidates.get(0).getUserId();
        }

        ChatRoom room = chatRoomService.createOrRestoreDirectRoom(claim.userId(), targetId);
        return ResponseEntity.ok(chatRoomService.toResponse(room));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<com.storks.livemessaging.dto.ChatRoomResponse> getRoomDetail(@PathVariable UUID roomId, @AuthenticationPrincipal UserAuthClaim claim) {
        log.info("REST: getRoomDetail - Room: {} | Claim: {}", roomId, claim != null ? claim.userId() : "NULL");
        if (claim == null || claim.userId() == null) {
            log.warn("REST: getRoomDetail - Returning 401 due to null claim");
            return ResponseEntity.status(401).build();
        }
        
        try {
            com.storks.livemessaging.dto.ChatRoomResponse response = chatRoomService.getRoomDetail(roomId);
            log.info("REST: getRoomDetail - Found room: {}", response.roomId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("REST: getRoomDetail - Error: {}", e.getMessage());
            throw e;
        }
    }
}



