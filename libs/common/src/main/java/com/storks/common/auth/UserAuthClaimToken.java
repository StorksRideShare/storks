package com.storks.common.auth;

import com.storks.models.dto.UserAuthClaim;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class UserAuthClaimToken extends AbstractAuthenticationToken {

    private final UserAuthClaim principal;

    public UserAuthClaimToken(UserAuthClaim principal, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        setAuthenticated(true);
    }

    @Override
    public Object getCredentials() {
        return null;
    }

    @Override
    public UserAuthClaim getPrincipal() {
        return principal;
    }
}
