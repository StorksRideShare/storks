package com.storks.userservice.config;

import com.clerk.backend_api.Clerk;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClerkConfig {

    @Value("${clerk.secret-key}")
    private String secretKey;

    @Bean
    public Clerk clerk() {
        return Clerk.builder()
                .bearerAuth(secretKey)
                .build();
    }
}
