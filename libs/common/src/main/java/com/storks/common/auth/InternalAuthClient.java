package com.storks.common.auth;

import com.storks.models.dto.UserAuthClaim;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class InternalAuthClient implements UserAuthService {

    private final RestClient restClient;
    private final String internalApiKey;

    public InternalAuthClient(
            RestClient.Builder restClientBuilder,
            @Value("${storks.internal.user-service-url}") String userServiceUrl,
            @Value("${storks.internal.api-key}") String internalApiKey) {
        this.restClient = restClientBuilder.baseUrl(userServiceUrl).build();
        this.internalApiKey = internalApiKey;
    }

    @Cacheable(value = "user_auth_claims_v4", key = "#p0")
    public UserAuthClaim getUserAuthClaim(String providerUserId, String email, String firstName, String lastName, String pictureUrl) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/internal/users/auth")
                        .queryParam("providerUserId", providerUserId)
                        .queryParam("email", email)
                        .queryParam("firstName", firstName)
                        .queryParam("lastName", lastName)
                        .queryParam("pictureUrl", pictureUrl)
                        .build())
                .header("X-Internal-Api-Key", internalApiKey)
                .retrieve()
                .body(UserAuthClaim.class);
    }
}
