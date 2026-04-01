
package com.storks.matching.service;

import com.storks.matching.model.TripStatus;
import com.storks.matching.repository.TripStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TripStatusService {

    @Autowired
    private TripStatusRepository repo;

    public TripStatus getLatestStatus() {
        return repo.findAll().stream().reduce((first, second) -> second).orElse(null);
    }

    public TripStatus save(TripStatus status) {
        return repo.save(status);
    }
}