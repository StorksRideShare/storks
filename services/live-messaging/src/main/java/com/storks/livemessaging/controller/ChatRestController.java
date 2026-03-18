package com.storks.livemessaging.controller;

import com.storks.livemessaging.dto.UserAuthClaim;
import com.storks.livemessaging.model.ChatRoom;
import com.storks.livemessaging.model.Message;
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

    @GetMapping
    public ResponseEntity<List<ChatRoom>> getUserChats(@AuthenticationPrincipal UserAuthClaim claim) {
        if (claim == null || claim.userId() == null) return ResponseEntity.status(401).build();
        
        List<ChatRoom> rooms = chatRoomService.getUserActiveRooms(claim.userId());
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<Page<Message>> getRoomMessages(
            @PathVariable UUID roomId,
            @PageableDefault(size = 50, sort = "sentAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal UserAuthClaim claim) {
            
        if (claim == null || claim.userId() == null) return ResponseEntity.status(401).build();
        
        Page<Message> messages = messageService.getMessageHistoryFromDb(roomId, pageable);
        return ResponseEntity.ok(messages);
    }
    
    @GetMapping("/{roomId}/messages/recent")
    public ResponseEntity<List<Object>> getRecentMessagesCache(@PathVariable UUID roomId, @AuthenticationPrincipal UserAuthClaim claim) {
        if (claim == null || claim.userId() == null) return ResponseEntity.status(401).build();
        
        List<Object> recentMessages = messageService.getRecentMessagesFromRedis(roomId);
        return ResponseEntity.ok(recentMessages);
    }
}
