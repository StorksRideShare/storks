package wdse17.matching.discovery.service;

import wdse17.matching.discovery.dto.*;
import wdse17.matching.discovery.model.*;
import wdse17.matching.discovery.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverService {

    private final DriverRepository driverRepository;
    private final GroupRepository groupRepository;

    // 🔥 Get driver profile
    public DriverResponse getDriver(Long id) {

        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        List<String> destinationList =
                Arrays.asList(driver.getDestinations().split(","));

        return new DriverResponse(
                driver.getId(),
                driver.getName(),
                driver.getRating(),
                driver.getExperienceYears(),
                driver.getSafeTrips(),
                driver.getVehicleName(),
                driver.getVehicleNumber(),
                destinationList
        );
    }

    // 🔥 Book driver
    public void bookDriver(Long driverId, BookingRequest request) {

        Group group = groupRepository.findById(request.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        // ✅ assign driver
        group.setDriverName(driver.getName());

        // 🔥 NEW
        group.setBookingDate(java.time.LocalDate.now());
        group.setStatus("BOOKED");

        groupRepository.save(group);
    }
}