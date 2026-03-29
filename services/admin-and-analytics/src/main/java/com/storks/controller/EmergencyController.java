package com.storks.controller;

import com.storks.dto.EmergencyEvent;
import com.storks.entity.EmergencyAlert;
import com.storks.service.EmergencyService;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/emergency")
public class EmergencyController {

    private final EmergencyService emergencyService;
    private final KafkaTemplate<String, EmergencyEvent> kafkaTemplate;

    public EmergencyController(EmergencyService emergencyService, KafkaTemplate<String, EmergencyEvent> kafkaTemplate) {
        this.emergencyService = emergencyService;
        this.kafkaTemplate = kafkaTemplate;
    }

    // Called by Parent or Driver app when button is pressed
    @PostMapping("/declare")
    public ResponseEntity<String> declareEmergency(@RequestBody EmergencyEvent event) {
        kafkaTemplate.send("emergency-alerts", event);
        return ResponseEntity.ok("Emergency alert published to Kafka");
    }

    // Admin report endpoint
    @GetMapping("/report")
    public ResponseEntity<List<EmergencyAlert>> getEmergencyReport() {
        return ResponseEntity.ok(emergencyService.getLatestAlerts());
    }
}