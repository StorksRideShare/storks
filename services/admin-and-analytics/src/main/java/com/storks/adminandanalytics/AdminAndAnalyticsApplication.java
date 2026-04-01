package com.storks.adminandanalytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(scanBasePackages = "com.storks")
@EnableJpaRepositories(basePackages = "com.storks.repository")
@EntityScan(basePackages = "com.storks")
@EnableScheduling
public class AdminAndAnalyticsApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminAndAnalyticsApplication.class, args);
    }
}