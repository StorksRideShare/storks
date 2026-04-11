package com.storks.matching.model;

import java.util.UUID;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private UUID id;

    private double latitude;
    private double UUIDitude;

    private String status; // ARRIVING, PIN, PICKUP, DROPOFF, ABSENT

    private String message; // "Arriving in 5 minutes"

    private String driverName;
    private String vehicle;
    private String plate;

    // getters & setters
}

