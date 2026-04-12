package com.storks.admin;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication(scanBasePackages = {"com.storks.admin", "com.storks.common"})
@EntityScan("com.storks")
@EnableJpaRepositories("com.storks")
@EnableCaching
public class AdminAndAnalyticsApplication {
    public static void main(String[] args) {
        SpringApplication.run(AdminAndAnalyticsApplication.class, args);
    }
}
