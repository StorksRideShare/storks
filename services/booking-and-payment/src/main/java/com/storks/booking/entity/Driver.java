package com.storks.booking.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@DiscriminatorValue("DRIVER")
@NoArgsConstructor
@AllArgsConstructor
public class Driver extends User {
    @Column(name = "country_code")
    private String countryCode;

    @Column(name = "number")
    private String number;

    @OneToMany(mappedBy = "driver", fetch = FetchType.LAZY)
    private java.util.List<Vehicle> vehicles;
}
