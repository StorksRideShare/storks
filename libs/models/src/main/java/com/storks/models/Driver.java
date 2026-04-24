package com.storks.models;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Getter
@Setter
@DiscriminatorValue("DRIVER")
@Table(name = "drivers")
@PrimaryKeyJoinColumn(name = "driver_id")
public class Driver extends User {

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "countryCode", column = @Column(name = "driver_primary_country_code")),
        @AttributeOverride(name = "number",      column = @Column(name = "driver_primary_number")),
        @AttributeOverride(name = "primary",     column = @Column(name = "driver_primary_is_primary")),
        @AttributeOverride(name = "isValidated", column = @Column(name = "driver_primary_validated")),
        @AttributeOverride(name = "addedAt",     column = @Column(name = "driver_primary_added_at")),
        @AttributeOverride(name = "updatedAt",   column = @Column(name = "driver_primary_updated_at"))
    })
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

    public Driver() {}
}
