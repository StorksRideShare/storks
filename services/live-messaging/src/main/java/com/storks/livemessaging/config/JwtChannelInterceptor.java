package com.storks.livemessaging.config;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private static final Logger log = LoggerFactory.getLogger(JwtChannelInterceptor.class);

    private final JwtDecoder jwtDecoder;
    private final UserAuthJwtAuthenticationConverter userAuthJwtAuthenticationConverter;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor == null) {
            log.debug("STOMP: No accessor for message on channel {}", channel);
            return message;
        }

        StompCommand command = accessor.getCommand();
        log.info("STOMP: Frame {} on channel {} | User: {}", 
                 command, channel, 
                 accessor.getUser() != null ? accessor.getUser().getName() : "NONE");

        if (StompCommand.CONNECT.equals(command)) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            log.info("STOMP: CONNECT header present: {}", authHeader != null);
            
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    AbstractAuthenticationToken auth = userAuthJwtAuthenticationConverter.convert(jwt);
                    accessor.setUser(auth);
                    log.info("STOMP: Authenticated user: {}", auth.getName());
                } catch (JwtException e) {
                    log.error("STOMP: JWT decode failed: {}", e.getMessage());
                    // We don't throw here to allow the frame to reach the handler which might return a 401
                } catch (Exception e) {
                    log.error("STOMP: Auth error: {}", e.getMessage(), e);
                }
            } else {
                log.warn("STOMP: CONNECT missing or invalid Authorization header");
            }
        }

        return message;
    }
}
