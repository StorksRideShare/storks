package com.storks.adminservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AdminServiceJavaApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminServiceJavaApplication.class, args);
    }

}
