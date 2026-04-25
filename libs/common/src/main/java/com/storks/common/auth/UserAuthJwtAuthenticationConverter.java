package com.storks.common.auth;

import com.storks.models.dto.UserAuthClaim;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserAuthJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserAuthService userAuthService;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        try {
            String providerUserId = jwt.getSubject();
            log.debug("Converting JWT for providerUserId: {}", providerUserId);

            String email = jwt.getClaimAsString("email");
            String firstName = jwt.getClaimAsString("given_name");
            String lastName = jwt.getClaimAsString("family_name");
            String pictureUrl = jwt.getClaimAsString("picture");

            UserAuthClaim claim = userAuthService.getUserAuthClaim(providerUserId, email, firstName, lastName, pictureUrl);
            
            if (claim == null) {
                log.error("Failed to retrieve UserAuthClaim for providerUserId: {}", providerUserId);
                throw new RuntimeException("User authorization claim not found");
            }

            Collection<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + claim.role()));
            log.debug("Authenticated user {} with role {}", claim.providerUserId(), claim.role());
            
            return new UserAuthClaimToken(claim, authorities);
        } catch (Exception e) {
            log.error("Error during JWT authentication conversion: {}", e.getMessage(), e);
            throw e;
        }
    }
}
