package com.storks.userservice.model;

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

    @Embedded
    @AttributeOverrides({
        @AttributeOverride(name = "countryCode",      column = @Column(name = "primary_country_code")),
        @AttributeOverride(name = "number",           column = @Column(name = "primary_number")),
        @AttributeOverride(name = "isPrimaryContact", column = @Column(name = "primary_is_primary")),
        @AttributeOverride(name = "validated",        column = @Column(name = "primary_validated")),
        @AttributeOverride(name = "addedAt",          column = @Column(name = "primary_added_at")),
        @AttributeOverride(name = "updatedAt",        column = @Column(name = "primary_updated_at"))
    })
    private PhoneNumber contactPrimaryNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "parent_secondary_phones", joinColumns = @JoinColumn(name = "parent_id"))
    private List<PhoneNumber> secondaryPhoneNumbers = new ArrayList<>();

    public Parent() {}
}