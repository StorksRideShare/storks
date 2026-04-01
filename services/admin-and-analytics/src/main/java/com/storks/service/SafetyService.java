package com.storks.service;

import com.storks.entity.DriverScore;
import com.storks.entity.VehicleMaintenance;
import com.storks.repository.DriverScoreRepository;
import com.storks.repository.VehicleMaintenanceRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class SafetyService {

    private final DriverScoreRepository driverScoreRepo;
    private final VehicleMaintenanceRepository vehicleMaintenanceRepo;

    public SafetyService(DriverScoreRepository driverScoreRepo, VehicleMaintenanceRepository vehicleMaintenanceRepo) {
        this.driverScoreRepo = driverScoreRepo;
        this.vehicleMaintenanceRepo = vehicleMaintenanceRepo;
    }

    public void updateDriverScore(UUID driverId, int newPositiveFeedback, boolean hadIncident) {
        DriverScore score = driverScoreRepo.findByDriverId(driverId)
                .orElse(new DriverScore());

        score.setDriverId(driverId);
        score.setTotalRides(score.getTotalRides() + 1);
        if (hadIncident) score.setIncidentsCount(score.getIncidentsCount() + 1);
        score.setPositiveFeedbackCount(score.getPositiveFeedbackCount() + newPositiveFeedback);

        double baseScore = 100.0;
        baseScore -= (score.getIncidentsCount() * 15);
        baseScore += (score.getPositiveFeedbackCount() * 2);
        score.setSafetyScore(Math.max(0, Math.min(100, baseScore)));

        driverScoreRepo.save(score);
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void checkExpiringDocuments() {
        List<VehicleMaintenance> expiring = vehicleMaintenanceRepo.findByExpiryDateBefore(LocalDate.now().plusDays(30));
        System.out.println("🚨 SAFETY ALERT: " + expiring.size() + " documents expiring soon!");
        expiring.forEach(doc -> {
            System.out.println("   → Vehicle " + doc.getVehicleId() + " - " + doc.getMaintenanceType() + " expires " + doc.getExpiryDate());
        });
    }

    public List<DriverScore> getAllDriverScores() {
        return driverScoreRepo.findAll();
    }

    public List<VehicleMaintenance> getAllMaintenanceRecords() {
        return vehicleMaintenanceRepo.findAll();
    }
}