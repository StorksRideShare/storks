package com.storks.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "offers")
public class Offer {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID offerId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @OneToMany(mappedBy = "offer", cascade = CascadeType.ALL)
    private List<Ride> rides = new ArrayList<>();

    private Boolean isUsingIntelligentPricing = false;

    public Boolean isUsingIntelligentPricing() {
        return isUsingIntelligentPricing;
    }

    private Double pricePerMonth = 0.0;
    private Double pricePerDay = 0.0;

    @OneToMany
    @JoinTable(
            name = "offer_destinations",
            joinColumns = @JoinColumn(name = "offer_id"),
            inverseJoinColumns = @JoinColumn(name = "location_id")
    )
    private List<Location> destinations = new ArrayList<>();
}
