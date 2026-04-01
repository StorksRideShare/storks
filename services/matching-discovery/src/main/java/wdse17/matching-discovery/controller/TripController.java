package wdse17.matching.discovery.controller;

import wdse17.matching.discovery.model.TripStatus;
import wdse17.matching.discovery.service.TripStatusService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trip")
@CrossOrigin
public class TripController {

    @Autowired
    private TripStatusService service;

    // 🔥 GET (Parent app uses this)
    @GetMapping("/status")
    public TripStatus getStatus() {
        return service.getLatestStatus();
    }

    // 🔥 POST (Driver app uses this)
    @PostMapping("/update")
    public TripStatus update(@RequestBody TripStatus status) {
        return service.save(status);
    }
}