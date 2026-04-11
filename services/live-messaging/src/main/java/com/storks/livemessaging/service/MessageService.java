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
    
    private static final String CHAT_MESSAGES_TOPIC = "chat-messages";
    private static final String REDIS_RECENT_MESSAGES_KEY_PREFIX = "room:messages:";
    
    public void publishMessageToKafka(ChatMessagePayload payload) {
        if (payload.getMessageId() == null) {
            payload.setMessageId(UUID.randomUUID());
        }
        if (payload.getSentAt() == null) {
            payload.setSentAt(OffsetDateTime.now());
        }
        
        kafkaTemplate.send(CHAT_MESSAGES_TOPIC, payload.getRoomId().toString(), payload)
                     .whenComplete((result, ex) -> {
                         if (ex != null) {
                             log.error("Failed to publish message: {}", payload.getMessageId(), ex);
                         } else {
                             log.info("Message published to Kafka. ID: {}", payload.getMessageId());
                         }
                     });
    }

    public void persistAndCacheMessage(ChatMessagePayload payload) {
        try {
            ChatRoom room = chatRoomRepository.findById(payload.getRoomId())
                    .orElseThrow(() -> new IllegalArgumentException("Room not found"));
                    
            User sender = userRepository.findByUserId(payload.getSenderId());
            if (sender == null) {
                log.error("Sender not found for message: {}", payload.getMessageId());
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
            
            // Cache in Redis (store as list, trim to keep last 50)
            String redisKey = REDIS_RECENT_MESSAGES_KEY_PREFIX + payload.getRoomId();
            redisTemplate.opsForList().leftPush(redisKey, payload);
            redisTemplate.opsForList().trim(redisKey, 0, 49); // Keep latest 50
            redisTemplate.expire(redisKey, 7, TimeUnit.DAYS);

        } catch (Exception e) {
            log.error("Error persisting message from Kafka: {}", payload.getMessageId(), e);
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
            }
        }
    }

    public Page<Message> getMessageHistoryFromDb(UUID roomId, Pageable pageable) {
        return messageRepository.findByRoom_RoomIdAndIsDeletedFalseOrderBySentAtDesc(roomId, pageable);
    }
    
    public List<Object> getRecentMessagesFromRedis(UUID roomId) {
        String redisKey = REDIS_RECENT_MESSAGES_KEY_PREFIX + roomId;
        return redisTemplate.opsForList().range(redisKey, 0, -1);
    }
}


