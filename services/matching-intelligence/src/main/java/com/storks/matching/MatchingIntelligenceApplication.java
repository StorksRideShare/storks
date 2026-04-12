package com.storks.matching;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = {"com.storks.matching", "com.storks.common"})
@EntityScan("com.storks")
@EnableJpaRepositories("com.storks")
public class MatchingIntelligenceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MatchingIntelligenceApplication.class, args);
    }
}

