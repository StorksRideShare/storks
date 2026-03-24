package com.storks.livemessaging.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

@Configuration
public class KafkaConfig {

    public static final String CHAT_MESSAGES_TOPIC = "chat-messages";

    @Bean
    public NewTopic chatMessagesTopic() {
        return TopicBuilder.name(CHAT_MESSAGES_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    @Bean
    public JsonSerializer<Object> jsonSerializer(ObjectMapper objectMapper) {
        return new JsonSerializer<>(objectMapper);
    }

    @Bean
    public JsonDeserializer<Object> jsonDeserializer(ObjectMapper objectMapper) {
        JsonDeserializer<Object> deserializer = new JsonDeserializer<>(objectMapper);
        deserializer.addTrustedPackages("*");
        // Ensure type information is handled correctly
        deserializer.setUseTypeHeaders(false); // If types don't match, we map manually or rely on @KafkaListener type
        return deserializer;
    }
}
