package com.storks.matching.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "driver_profiles")
public class DriverProfile {

    @Id
    @Column(name = "driver_id")
    private UUID driverId;

    private double rating;
    private int experienceYears;
    private int safeTrips;
}

