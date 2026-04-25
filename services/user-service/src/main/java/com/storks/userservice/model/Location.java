package com.storks.userservice.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "locations")
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID locationId;

    private String address;

    @Column(name = "is_verified")
    private boolean isVerified;

    @Column(nullable = false)
    private BigDecimal latitude;

    @Column(nullable = false)
    private BigDecimal longitude;

    private String nickname;

    public Location() {}

    public Location(String address, BigDecimal latitude, BigDecimal longitude) {
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isVerified = false;
    }
}
