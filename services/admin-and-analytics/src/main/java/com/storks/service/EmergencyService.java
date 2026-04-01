package com.storks.service;

import com.storks.dto.EmergencyEvent;
import com.storks.entity.EmergencyAlert;
import com.storks.repository.EmergencyAlertRepository;
import com.storks.util.DistanceCalculator;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmergencyService {

    private final EmergencyAlertRepository repository;

    public EmergencyService(EmergencyAlertRepository repository) {
        this.repository = repository;
    }

    @KafkaListener(topics = "emergency-alerts", groupId = "admin-emergency-group")
    public void handleEmergency(EmergencyEvent event) {
        EmergencyAlert alert = new EmergencyAlert();
        alert.setParentId(event.getParentId());
        alert.setDriverId(event.getDriverId());
        alert.setRideId(event.getRideId());
        alert.setParentLat(event.getParentLat());
        alert.setParentLon(event.getParentLon());
        alert.setDriverLat(event.getDriverLat());
        alert.setDriverLon(event.getDriverLon());
        alert.setAlertType(event.getAlertType());
        alert.setMessage(event.getMessage());

        if (event.getParentLat() != null && event.getDriverLat() != null) {
            double distance = DistanceCalculator.calculateDistanceKm(
                    event.getParentLat(), event.getParentLon(),
                    event.getDriverLat(), event.getDriverLon());
            alert.setDistanceKm(distance);
        }

        repository.save(alert);
        System.out.println("🚨 EMERGENCY ALERT RECEIVED & SAVED! Distance: " + alert.getDistanceKm() + " km");
    }

    public List<EmergencyAlert> getLatestAlerts() {
        return repository.findTop10ByOrderByTimestampDesc();
    }
}