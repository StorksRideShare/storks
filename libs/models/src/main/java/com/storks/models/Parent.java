package com.storks.models;

import com.storks.models.types.PaymentMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@DiscriminatorValue("PARENT")
@Table(name = "parents")
@PrimaryKeyJoinColumn(name = "parent_id")
public class Parent extends User {

    private LocalDate dateOfBirth;
    private String address;

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "countryCode",column = @Column(name = "primary_country_code")),
        @AttributeOverride(name = "number",column = @Column(name = "primary_number")),
        @AttributeOverride(name = "primary", column = @Column(name = "primary_is_primary")),
        @AttributeOverride(name = "isValidated", column = @Column(name = "primary_validated")),
        @AttributeOverride(name = "addedAt",column = @Column(name = "primary_added_at")),
        @AttributeOverride(name = "updatedAt",column = @Column(name = "primary_updated_at"))
    })
    private PhoneNumber contactPrimaryNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "parent_secondary_phones", joinColumns = @JoinColumn(name = "parent_id"))
    private List<PhoneNumber> secondaryPhoneNumbers = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentPreferred;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Card> cards;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Child> children;

    public Parent() {}
}
