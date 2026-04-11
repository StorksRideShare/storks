
package com.storks.matching.controller;

import java.util.UUID;
import com.storks.matching.dto.*;
import com.storks.matching.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@CrossOrigin
public class DriverController {

    private final DriverService driverService;

    // ✅ Get driver profile
    @GetMapping("/{id}")
    public DriverResponse getDriver(@PathVariable UUID id) {
        return driverService.getDriver(id);
    }
}


