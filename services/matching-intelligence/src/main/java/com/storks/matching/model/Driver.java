package com.storks.matching.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private double rating;
    private int experienceYears;
    private int safeTrips;

    private String vehicleName;
    private String vehicleNumber;

    // comma separated destinations (simple way)
    private String destinations;
}