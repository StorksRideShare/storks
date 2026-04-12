package com.storks.common.auth;

import com.storks.models.dto.UserAuthClaim;

public interface UserAuthService {
    UserAuthClaim getUserAuthClaim(String providerUserId, String email, String firstName, String lastName, String pictureUrl);
}
