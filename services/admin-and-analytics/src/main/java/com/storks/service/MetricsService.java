package com.storks.service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.stereotype.Service;

import com.storks.dto.RideEvent;

@Service
public class MetricsService {

    // Simple in-memory counters (for demo; use Redis/Caffeine for prod)
    private final AtomicInteger activeRides = new AtomicInteger(0);
    private final AtomicInteger locationUpdatesLastMinute = new AtomicInteger(0);

    // Map<rideId, lastActiveTimestamp> to detect stale rides (optional cleanup)
    private final Map<String, Long> activeRideTimestamps = new ConcurrentHashMap<>();

    public void handleRideEvent(RideEvent event) {
        if (event.getStatus() == null) return;

        String status = event.getStatus().toLowerCase();
        String rideIdStr = event.getRideId().toString();

        if (status.contains("active") || status.contains("in_progress") || status.contains("started")) {
            activeRides.incrementAndGet();
            activeRideTimestamps.put(rideIdStr, System.currentTimeMillis());
        } else if (status.contains("completed") || status.contains("ended") || status.contains("cancelled")) {
            if (activeRideTimestamps.remove(rideIdStr) != null) {
                activeRides.decrementAndGet();
            }
        }

        // Optional: count location updates (if event is location type)
        // if ("location_update".equals(event.getEventType())) { ... }
    }

    public int getActiveRidesCount() {
        // Optional: clean stale (e.g. no update > 5 min)
        activeRideTimestamps.entrySet().removeIf(entry -> 
            System.currentTimeMillis() - entry.getValue() > 300_000); // 5 min
        return activeRides.get();
    }

    // Add more metrics as needed (e.g. updates per min, reset every 60s with @Scheduled)
}
