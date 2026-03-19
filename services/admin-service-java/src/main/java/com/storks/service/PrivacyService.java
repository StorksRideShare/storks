package com.storks.service;

import com.storks.entity.PrivacySettings;
import com.storks.repository.PrivacySettingsRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PrivacyService {

    private final PrivacySettingsRepository repository;
    private final ObjectMapper objectMapper;

    public PrivacyService(PrivacySettingsRepository repository, ObjectMapper objectMapper) {
        this.repository = repository;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> getSettings(UUID userId) {
        Optional<PrivacySettings> opt = repository.findByUserId(userId);
        if (opt.isEmpty()) {
            // Default safe settings
            Map<String, Object> defaults = new HashMap<>();
            defaults.put("shareLocationOnlyActiveRide", true);
            defaults.put("maskFullAddress", true);
            defaults.put("allowSilentPresence", false);
            defaults.put("allowAudioStream", false);
            return defaults;
        }

        try {
            return objectMapper.readValue(opt.get().getSettings(), Map.class);
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    public void saveSettings(UUID userId, Map<String, Object> newSettings) {
        repository.deleteByUserId(userId);

        PrivacySettings ps = new PrivacySettings();
        ps.setUserId(userId);

        try {
            ps.setSettings(objectMapper.writeValueAsString(newSettings));
        } catch (Exception e) {
            ps.setSettings("{}");
        }

        repository.save(ps);
    }
}