package com.storks.controller;

import com.storks.entity.DriverScore;
import com.storks.entity.VehicleMaintenance;
import com.storks.service.SafetyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/safety")
public class SafetyController {

    private final SafetyService safetyService;

    public SafetyController(SafetyService safetyService) {
        this.safetyService = safetyService;
    }

    @GetMapping("/driver-scores")
    public ResponseEntity<List<DriverScore>> getDriverScores() {
        return ResponseEntity.ok(safetyService.getAllDriverScores());
    }

    @GetMapping("/maintenance")
    public ResponseEntity<List<VehicleMaintenance>> getMaintenance() {
        return ResponseEntity.ok(safetyService.getAllMaintenanceRecords());
    }

    @PostMapping("/update-score/{driverId}")
    public ResponseEntity<String> updateScore(@PathVariable UUID driverId,
                                              @RequestParam int positiveFeedback,
                                              @RequestParam boolean hadIncident) {
        safetyService.updateDriverScore(driverId, positiveFeedback, hadIncident);
        return ResponseEntity.ok("Driver score updated successfully");
    }
}