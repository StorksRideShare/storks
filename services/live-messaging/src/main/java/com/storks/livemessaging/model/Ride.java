package com.storks.livemessaging.model;

import com.storks.livemessaging.model.types.RideStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "rides")
public class Ride {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID rideId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @OneToMany(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id")
    private List<ChildGroup> groups;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RideStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offer_id")
    private Offer offer;

    @OneToMany(mappedBy = "ride", cascade = CascadeType.ALL)
    private List<RideLeg> legs = new ArrayList<>();
}