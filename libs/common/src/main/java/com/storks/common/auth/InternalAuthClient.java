package com.storks.common.auth;

import com.storks.models.dto.UserAuthClaim;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class InternalAuthClient {

    private final RestClient restClient;
    private final String internalApiKey;

    public InternalAuthClient(
            RestClient.Builder restClientBuilder,
            @Value("${storks.internal.user-service-url}") String userServiceUrl,
            @Value("${storks.internal.api-key}") String internalApiKey) {
        this.restClient = restClientBuilder.baseUrl(userServiceUrl).build();
        this.internalApiKey = internalApiKey;
    }

    @Cacheable(value = "userClaims", key = "#providerUserId")
    public UserAuthClaim getUserAuthClaim(String providerUserId) {
        return restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/internal/users/auth")
                        .queryParam("providerUserId", providerUserId)
                        .build())
                .header("X-Internal-Api-Key", internalApiKey)
                .retrieve()
                .body(UserAuthClaim.class);
    }
}
