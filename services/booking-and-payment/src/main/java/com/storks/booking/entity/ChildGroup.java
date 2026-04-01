package com.storks.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.util.List;

@Entity
@Table(name = "child_groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChildGroup {
    @Id
    @Column(name = "group_id")
    private UUID groupId;

    @Column(name = "parent_id")
    private UUID parentId;

    @ManyToOne
    @JoinColumn(name = "pickup_location_id")
    private Location pickupLocation;

    @ManyToOne
    @JoinColumn(name = "default_dropoff_location_id")
    private Location defaultDropoffLocation;

    @OneToMany(mappedBy = "childGroup")
    private List<Child> children;
}
