
package wdse17.matching.discovery.controller;

import wdse17.matching.discovery.dto.*;
import wdse17.matching.discovery.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
@CrossOrigin
public class DriverController {

    private final DriverService driverService;

    // ✅ Get driver profile
    @GetMapping("/{id}")
    public DriverResponse getDriver(@PathVariable Long id) {
        return driverService.getDriver(id);
    }

    // ✅ Book driver
    @PostMapping("/{id}/book")
    public void bookDriver(
            @PathVariable Long id,
            @RequestBody BookingRequest request
    ) {
        driverService.bookDriver(id, request);
    }
}