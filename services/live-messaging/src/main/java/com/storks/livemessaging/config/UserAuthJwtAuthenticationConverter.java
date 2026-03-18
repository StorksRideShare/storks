package com.storks.livemessaging.config;

import com.storks.livemessaging.dto.UserAuthClaim;
import com.storks.livemessaging.errors.InvalidUserIdException;
import com.storks.livemessaging.service.UserAuthService;
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
        String userId = jwt.getClaims().get("userId").toString();
        UserAuthClaim userClaim;
        Logger logger = LoggerFactory.getLogger(UserAuthJwtAuthenticationConverter.class);
        logger.info("Converting JWT Claims to UserAuthClaim{}", userId);
        try {
            userClaim = userAuthService.getUserById(userId);
        } catch (IllegalArgumentException | InvalidUserIdException e) {
            return null;
        }
        return new UsernamePasswordAuthenticationToken(userClaim, jwt, Collections.emptyList());
    }
}
