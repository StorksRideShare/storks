package com.storks.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "offers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Offer {
    @Id
    @Column(name = "offer_id")
    private UUID offerId;

    @OneToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @OneToOne
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Column(name = "is_using_intelligent_pricing")
    private Boolean isUsingIntelligentPricing;

    @Column(name = "price_per_month")
    private Double pricePerMonth;

    @Column(name = "price_per_day")
    private Double pricePerDay;

    @ManyToMany
    @JoinTable(
        name = "offer_destinations",
        joinColumns = @JoinColumn(name = "offer_id"),
        inverseJoinColumns = @JoinColumn(name = "location_id")
    )
    private List<Location> destinations;
}
