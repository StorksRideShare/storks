package com.storks.entity;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonView;
import com.storks.views.UserViews;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "locations")
@Data
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Full detailed address – ONLY admin sees this
    @JsonView(UserViews.AdminView.class)
    @Column(columnDefinition = "TEXT")
    private String fullAddress;

    // Short / masked version – area, city district, landmark
    // This is what driver and parent usually see
    @JsonView({UserViews.DriverView.class, UserViews.ParentView.class, UserViews.AdminView.class})
    @Column(nullable = false)
    private String shortName;           // e.g. "Colombo 03", "Battaramulla"

    // Optional – more coarse location for driver matching / privacy
    @JsonView({UserViews.DriverView.class, UserViews.ParentView.class, UserViews.AdminView.class})
    private String area;

    // Geolocation – can be shown to driver/parent during active ride
    // (but consider masking precision in lower roles)
    @JsonView({UserViews.ParentView.class, UserViews.AdminView.class})
    private Double latitude;

    @JsonView({UserViews.ParentView.class, UserViews.AdminView.class})
    private Double longitude;

    // Optional label (home, school, tuition, etc.)
    @JsonView({UserViews.DriverView.class, UserViews.ParentView.class, UserViews.AdminView.class})
    private String label;

    // If you want extreme masking for driver → you can even remove lat/lng for DriverView
    // and only give approximate area name
}