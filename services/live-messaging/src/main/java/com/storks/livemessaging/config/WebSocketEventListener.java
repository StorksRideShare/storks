package com.storks.livemessaging.config;

import com.storks.models.dto.UserAuthClaim;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private static final Logger log = LoggerFactory.getLogger(WebSocketEventListener.class);
    private final RedisTemplate<String, Object> redisTemplate;
    public static final String ONLINE_KEY_PREFIX = "user:online:";

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof UserAuthClaim claim) {
                UUID userId = claim.userId();
                redisTemplate.opsForValue().set(ONLINE_KEY_PREFIX + userId, true, 24, TimeUnit.HOURS);
                log.info("User {} connected to WebSocket, status set to online", userId);
            }
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        if (accessor.getUser() instanceof UsernamePasswordAuthenticationToken auth) {
            if (auth.getPrincipal() instanceof UserAuthClaim claim) {
                UUID userId = claim.userId();
                redisTemplate.delete(ONLINE_KEY_PREFIX + userId);
                log.info("User {} disconnected from WebSocket, status removed", userId);
            }
        }
    }
}


