package com.storks.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@Table(name = "drivers")
public class Driver extends User{

    @Column(nullable = false)
    private PhoneNumber contactPrimaryNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "driver_secondary_phones", joinColumns = @JoinColumn(name = "driver_id"))
    private List<PhoneNumber> secondaryPhoneNumbers;

    @OneToOne(mappedBy = "driver")
    private DriverLicense license;

    @OneToOne(mappedBy = "driver")
    private Vehicle vehicle;

    @OneToOne(mappedBy = "driver")
    private Offer offer;
}
