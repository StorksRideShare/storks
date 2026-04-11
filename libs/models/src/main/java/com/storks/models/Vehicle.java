package com.storks.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.awt.*;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "vehicles")
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID vehicleId;

    private String nickname;

    @Column(nullable = false, unique = true)
    private String licensePlate;

    @OneToMany
    @JoinTable(
            name = "vehicle_assets",
            uniqueConstraints = @UniqueConstraint(columnNames = {"asset_id"}),
            joinColumns = @JoinColumn(name = "vehicle_id"),
            inverseJoinColumns = @JoinColumn(name = "asset_id")
    )
    private List<Assets> images;


    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;
}
