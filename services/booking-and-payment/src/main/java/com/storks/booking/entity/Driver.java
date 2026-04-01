package com.storks.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Driver {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "country_code")
    private String countryCode;

    @Column(name = "number")
    private String number;

    @OneToMany(mappedBy = "driver", fetch = FetchType.LAZY)
    private java.util.List<Vehicle> vehicles;
}
