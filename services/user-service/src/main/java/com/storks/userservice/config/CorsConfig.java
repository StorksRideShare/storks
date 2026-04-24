package com.storks.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allowed origins: local dev, expo web, android emulator, and all storks ports
        config.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
            "http://localhost:8080",
            "http://localhost:8081",
            "http://localhost:8082",
            "http://localhost:8083",
            "http://localhost:8084",
            "http://localhost:8085",
            "http://localhost:8086",
            "http://localhost:8087",
            "http://localhost:8088",
            "http://localhost:8089",
            "http://10.0.2.2:8081",
            "http://10.0.2.2:8082",
            "http://10.0.2.2:8083"
        ));

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
