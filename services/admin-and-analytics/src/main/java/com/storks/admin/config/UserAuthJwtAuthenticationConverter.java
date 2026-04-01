package com.storks.admin.config;

import com.storks.admin.dto.UserAuthClaim;
import com.storks.admin.service.UserAuthService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class UserAuthJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final UserAuthService userAuthService;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Object sub = jwt.getClaims().get("sub");
        Logger logger = LoggerFactory.getLogger(UserAuthJwtAuthenticationConverter.class);
        
        if (sub == null) {
            logger.warn("JWT conversion failed: 'sub' claim is missing");
            return null;
        }
        
        String userId = sub.toString();
        logger.info("Converting JWT Claims to UserAuthClaim for providerUserId: {}", userId);
        
        UserAuthClaim userClaim;
        try {
            userClaim = userAuthService.getUserById(userId);
            logger.info("Successfully retrieved UserAuthClaim for userId: {}", userClaim.userId());
        } catch (Exception e) {
            logger.error("User mapping failed for provider ID: {} - Error: {}", userId, e.getMessage());
            throw new org.springframework.security.oauth2.server.resource.InvalidBearerTokenException("User mapping failed: " + e.getMessage());
        }
        
        return new UsernamePasswordAuthenticationToken(userClaim, jwt, Collections.emptyList());
    }
}
