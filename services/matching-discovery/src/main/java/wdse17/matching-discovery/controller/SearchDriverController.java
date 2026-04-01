package wdse17.matching.discovery.controller;

import wdse17.matching.discovery.dto.*;
import wdse17.matching.discovery.service.SearchDriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@CrossOrigin
public class SearchDriverController {

    private final SearchDriverService driverService;

    // 🔍 Search drivers
    @GetMapping("/search")
    public List<SearchDriverResponse> searchDrivers(
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) Boolean ac,
            @RequestParam(required = false) Boolean nfc
    ) {
        return driverService.searchDrivers(seats, ac, nfc);
    }

    // 👤 Get driver profile
    @GetMapping("/{id}")
    public SearchDriverResponse getDriverById(@PathVariable Long id) {
        return driverService.getDriverById(id);
    }

    // 📌 Book driver
    @PostMapping("/{id}/book")
    public String bookDriver(
            @PathVariable Long id,
            @RequestParam Long groupId
    ) {
        return driverService.bookDriver(id, groupId);
    }
}
