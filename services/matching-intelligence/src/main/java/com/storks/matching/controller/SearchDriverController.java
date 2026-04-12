package com.storks.matching.controller;

import java.util.UUID;
import com.storks.matching.dto.*;
import com.storks.matching.service.SearchDriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/drivers/search")
@RequiredArgsConstructor
@CrossOrigin
public class SearchDriverController {

    private final SearchDriverService driverService;

    @GetMapping
    public List<SearchDriverResponse> searchDrivers(
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) Boolean ac,
            @RequestParam(required = false) Boolean nfc
    ) {
        return driverService.searchDrivers(seats, ac, nfc);
    }

    // 👤 Get driver profile
    @GetMapping("/{id}")
    public SearchDriverResponse getDriverById(@PathVariable UUID id) {
        return driverService.getDriverById(id);
    }

    @PostMapping("/{id}/book")
    public String bookDriver(
            @PathVariable UUID id,
            @RequestParam UUID groupId
    ) {
        return driverService.bookDriver(id, groupId);
    }
}


