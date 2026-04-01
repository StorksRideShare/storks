package com.storks.matching.service;

import com.storks.matching.dto.SearchDriverResponse;
import com.storks.matching.model.SearchDriver;
import com.storks.matching.repository.SearchDriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchDriverService {

    private final SearchDriverRepository driverRepository;

    public List<SearchDriverResponse> searchDrivers(Integer seats, Boolean ac, Boolean nfc) {

        List<SearchDriver> drivers = driverRepository.findAll();

        return drivers.stream()
                .filter(d -> seats == null || d.getAvailableSeats() >= seats)
                .filter(d -> ac == null || d.isAc() == ac)
                .filter(d -> nfc == null || d.isNfc() == nfc)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    // ✅ Get driver by ID
    public SearchDriverResponse getDriverById(Long id) {
        SearchDriver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        return mapToDTO(driver);
    }

    // ✅ Book driver
    public String bookDriver(Long driverId, Long groupId) {
        SearchDriver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (driver.getAvailableSeats() > 0) {
            driver.setAvailableSeats(driver.getAvailableSeats() - 1);
            driverRepository.save(driver);
            return "Driver booked successfully for group " + groupId;
        } else {
            return "No available seats";
        }
    }

    private SearchDriverResponse mapToDTO(SearchDriver d) {
        return new SearchDriverResponse(
                d.getId(),
                d.getName(),
                d.getVehicle(),
                d.getPlate(),
                d.getAvailableSeats(),
                d.getTotalSeats(),
                d.isAc(),
                d.isNfc(),
                d.isVerified()
        );
    }
}