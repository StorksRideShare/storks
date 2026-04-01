package com.storks.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PrivacyMaskingService {

    private final PrivacyService privacyService;  // the one we created yesterday
    private final ObjectMapper objectMapper;

    public PrivacyMaskingService(PrivacyService privacyService, ObjectMapper objectMapper) {
        this.privacyService = privacyService;
        this.objectMapper = objectMapper;
    }

    /**
     * Applies privacy settings to any object (entity or DTO) before returning to client
     */
    public <T> T maskObject(T object, UUID userId) {
        if (object == null) return null;

        Map<String, Object> settings = privacyService.getSettings(userId);

        // Convert object to Map for easy field removal
        Map<String, Object> dataMap = objectMapper.convertValue(object, Map.class);

        // Apply masks based on parent's settings
        if (Boolean.TRUE.equals(settings.get("maskFullAddress"))) {
            dataMap.remove("permanentAddress");
            dataMap.remove("fullAddress");
            dataMap.remove("permanent_resident_address");
        }

        if (Boolean.FALSE.equals(settings.get("allowSilentPresence"))) {
            dataMap.remove("silentPresenceRequests");
        }

        if (Boolean.FALSE.equals(settings.get("allowAudioStream"))) {
            dataMap.remove("audioStreamRequests");
        }

        // You can add more rules here later (medical notes, disabilities, etc.)

        // Convert back to original type
        return objectMapper.convertValue(dataMap, (Class<T>) object.getClass());
    }
}