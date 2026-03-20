package com.storks.livemessaging.controller;

import com.storks.livemessaging.dto.PingMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PingController {

    private final KafkaTemplate<String, PingMessage> kafkaTemplate;

    @PostMapping("/ping")
    public String sendPingMessage(@RequestParam(defaultValue = "ping")  String message) {
        PingMessage ping = new PingMessage(message,  System.currentTimeMillis());
        kafkaTemplate.send("ping", ping);
        return "ping sent" + ping;
    }
}
