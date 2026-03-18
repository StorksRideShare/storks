package com.storks.livemessaging.config;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
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

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authorizationHeader = accessor.getFirstNativeHeader("Authorization");
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                try {
                    Jwt jwt = jwtDecoder.decode(token);
                    AbstractAuthenticationToken authentication = userAuthJwtAuthenticationConverter.convert(jwt);
                    if (authentication == null) {
                        throw new IllegalArgumentException("Invalid internal user mapping");
                    }
                    accessor.setUser(authentication);
                } catch (Exception e) {
                    log.error("Failed to decode JWT token during STOMP CONNECT", e);
                    throw new IllegalArgumentException("Invalid JWT token");
                }
            } else {
                log.warn("STOMP CONNECT missing Authorization header");
                throw new IllegalArgumentException("Missing Authorization header");
            }
        }
        return message;
    }
}
