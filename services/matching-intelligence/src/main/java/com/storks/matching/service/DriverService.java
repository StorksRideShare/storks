package com.storks.matching.service;

import java.util.UUID;
import com.storks.matching.dto.*;
import com.storks.models.*;
import com.storks.matching.model.DriverProfile;
import com.storks.matching.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final GroupRepository groupRepository;

    public DriverResponse getDriver(UUID id) {

        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
                
        DriverProfile profile = driverProfileRepository.findById(id)
                .orElse(new DriverProfile(id, 5.0, 0, 0));

        List<String> destinationList = Collections.emptyList();
        
        String vehicleName = driver.getVehicle() != null ? driver.getVehicle().getNickname() : "Unknown";
        String vehicleNumber = driver.getVehicle() != null ? driver.getVehicle().getLicensePlate() : "Unknown";

        return new DriverResponse(
                driver.getUserId(),
                driver.getFirstName() + " " + driver.getLastName(),
                profile.getRating(),
                profile.getExperienceYears(),
                profile.getSafeTrips(),
                vehicleName,
                vehicleNumber,
                destinationList
        );
    }

    public void bookDriver(UUID driverId, BookingRequest request) {

        ChildGroup childGroup = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("ChildGroup not found"));

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // In new architecture, booking is handled by booking-and-payment service
        // So Matching Service just acknowledges it conceptually.
        // We do not mutate ChildGroup because it doesn't store bookings natively anymore.
    }
}
