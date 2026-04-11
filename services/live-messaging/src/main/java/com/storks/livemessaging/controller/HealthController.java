package com.storks.livemessaging.controller;

import com.storks.models.Parent;
import com.storks.models.PhoneNumber;
import com.storks.models.types.ProviderType;
import com.storks.models.types.RoleType;
import com.storks.livemessaging.repositories.ParentRepository;
import com.storks.livemessaging.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class HealthController {
    private final ParentRepository parentRepository;
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("I'm alive");
    }
}


