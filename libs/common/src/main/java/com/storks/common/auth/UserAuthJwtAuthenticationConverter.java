package com.storks.common.auth;

import com.storks.models.dto.UserAuthClaim;
import lombok.RequiredArgsConstructor;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
public class UserAuthJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final InternalAuthClient internalAuthClient;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String providerUserId = jwt.getSubject();
        
        UserAuthClaim claim = internalAuthClient.getUserAuthClaim(providerUserId);

        Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + claim.role()));
        return new JwtAuthenticationToken(jwt, authorities, claim.providerUserId());
    }
}
