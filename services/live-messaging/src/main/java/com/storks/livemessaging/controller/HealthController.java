package com.storks.livemessaging.controller;

import com.storks.livemessaging.model.Parent;
import com.storks.livemessaging.model.PhoneNumber;
import com.storks.livemessaging.model.types.ProviderType;
import com.storks.livemessaging.model.types.RoleType;
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
