package com.storks.livemessaging.service;

import com.storks.livemessaging.dto.ChatMessagePayload;
import com.storks.models.ChatRoom;
import com.storks.models.Message;
import com.storks.models.User;
import com.storks.livemessaging.repositories.ChatRoomRepository;
import com.storks.livemessaging.repositories.MessageRepository;
import com.storks.livemessaging.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageService.class);

    private final MessageRepository messageRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final RedisTemplate<String, Object> redisTemplate;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    
    private static final String REDIS_RECENT_MESSAGES_KEY_PREFIX = "room:messages:";

    @org.springframework.transaction.annotation.Transactional
    public void processAndBroadcastMessage(ChatMessagePayload payload) {
        if (payload.getMessageId() == null) {
            payload.setMessageId(UUID.randomUUID());
        }
        if (payload.getSentAt() == null) {
            payload.setSentAt(OffsetDateTime.now());
        }

        log.info("Attempting to persist and cache message: {} for room: {} from sender: {}", 
                payload.getMessageId(), payload.getRoomId(), payload.getSenderId());
        
        try {
            ChatRoom room = chatRoomRepository.findById(payload.getRoomId())
                    .orElse(null);
            
            if (room == null) {
                log.error("CANNOT SAVE MESSAGE: Room not found for ID: {}. Payload: {}", payload.getRoomId(), payload);
                return;
            }
                    
            User sender = userRepository.findById(payload.getSenderId()).orElse(null);
            if (sender == null) {
                log.error("CANNOT SAVE MESSAGE: Sender not found for ID: {}. Payload: {}", payload.getSenderId(), payload);
                return;
            }

            Message message = new Message();
            message.setMessageId(payload.getMessageId());
            message.setRoom(room);
            message.setSender(sender);
            message.setContent(payload.getContent());
            message.setSentAt(payload.getSentAt());
            message.setType(payload.getType());
            message.setDeleted(false);
            
            messageRepository.save(message);
            log.info("Successfully persisted message: {} to database", payload.getMessageId());
            
            // Cache in Redis (store as list, trim to keep last 50)
            String redisKey = REDIS_RECENT_MESSAGES_KEY_PREFIX + payload.getRoomId();
            redisTemplate.opsForList().leftPush(redisKey, payload);
            redisTemplate.opsForList().trim(redisKey, 0, 49); // Keep latest 50
            redisTemplate.expire(redisKey, 7, TimeUnit.DAYS);
            log.debug("Message cached in Redis: {}", payload.getMessageId());

            // Broadcast directly to WebSocket clients
            log.debug("Broadcasting message {} to /topic/room/{}", payload.getMessageId(), payload.getRoomId());
            messagingTemplate.convertAndSend("/topic/room/" + payload.getRoomId(), payload);

        } catch (Exception e) {
            log.error("Unexpected error processing message: {}", payload.getMessageId(), e);
        }
    }

    @org.springframework.transaction.annotation.Transactional
    public void markMessageAsRead(UUID messageId, UUID userId) {
        Message message = messageRepository.findById(messageId).orElse(null);
        User user = userRepository.findByUserId(userId);
        if (message != null && user != null) {
            if (!message.getReadBy().contains(user)) {
                message.getReadBy().add(user);
                messageRepository.save(message);
                
                // Try to update it in Redis cache as well
                updateReadReceiptInRedis(message.getRoom().getRoomId(), messageId, userId);
            }
        }
    }
    
    private void updateReadReceiptInRedis(UUID roomId, UUID messageId, UUID userId) {
        String redisKey = REDIS_RECENT_MESSAGES_KEY_PREFIX + roomId;
        List<Object> cached = redisTemplate.opsForList().range(redisKey, 0, -1);
        if (cached != null) {
            for (int i = 0; i < cached.size(); i++) {
                Object obj = cached.get(i);
                if (obj instanceof ChatMessagePayload payload) {
                    if (payload.getMessageId().equals(messageId)) {
                        if (payload.getReadBy() == null) {
                            payload.setReadBy(new java.util.ArrayList<>());
                        }
                        if (!payload.getReadBy().contains(userId)) {
                            payload.getReadBy().add(userId);
                            redisTemplate.opsForList().set(redisKey, i, payload);
                        }
                        break;
                    }
                }
            }
        }
    }
    
    public void broadcastMessageOnly(ChatMessagePayload payload) {
        if (payload.getSentAt() == null) {
            payload.setSentAt(OffsetDateTime.now());
        }
        log.debug("Broadcasting read receipt {} to /topic/room/{}", payload.getMessageId(), payload.getRoomId());
        messagingTemplate.convertAndSend("/topic/room/" + payload.getRoomId(), payload);
    }

    public Page<ChatMessagePayload> getMessageHistory(UUID roomId, Pageable pageable) {
        // If requesting the first page, try Redis first
        if (pageable.getPageNumber() == 0) {
            String redisKey = REDIS_RECENT_MESSAGES_KEY_PREFIX + roomId;
            List<Object> cached = redisTemplate.opsForList().range(redisKey, 0, -1);
            if (cached != null && !cached.isEmpty()) {
                List<ChatMessagePayload> cachedPayloads = cached.stream()
                        .filter(obj -> obj instanceof ChatMessagePayload)
                        .map(obj -> (ChatMessagePayload) obj)
                        .collect(java.util.stream.Collectors.toList());
                
                if (!cachedPayloads.isEmpty()) {
                    log.info("Returning {} messages from Redis cache for room {}", cachedPayloads.size(), roomId);
                    int start = 0;
                    int end = Math.min((start + pageable.getPageSize()), cachedPayloads.size());
                    List<ChatMessagePayload> subList = cachedPayloads.subList(start, end);
                    // Since it's from cache, we might not know total elements, but we fake it or use size
                    return new org.springframework.data.domain.PageImpl<>(subList, pageable, cachedPayloads.size());
                }
            }
        }
        
        // Fallback to database
        log.info("Fetching messages from DB for room {}", roomId);
        Page<Message> messages = messageRepository.findByRoom_RoomIdAndDeletedFalseOrderBySentAtDesc(roomId, pageable);
        return messages.map(this::toPayload);
    }
    
    private ChatMessagePayload toPayload(Message message) {
        ChatMessagePayload payload = new ChatMessagePayload();
        payload.setMessageId(message.getMessageId());
        payload.setRoomId(message.getRoom().getRoomId());
        payload.setSenderId(message.getSender().getUserId());
        payload.setContent(message.getContent());
        payload.setSentAt(message.getSentAt());
        payload.setType(message.getType());
        
        if (message.getReadBy() != null) {
            payload.setReadBy(message.getReadBy().stream()
                    .map(User::getUserId)
                    .collect(java.util.stream.Collectors.toList()));
        }
        return payload;
    }
}


