package com.storks.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "child_groups")
public class ChildGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID groupId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Parent parent;

    @Column(name = "ride_id")
    private UUID rideId;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
    private List<Child> children = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pickup_location_id")
    private Location pickupLocation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "default_dropoff_location_id")
    private Location defaultDropOffLocation;

    public ChildGroup() {}
}
