package com.storks.livemessaging.model;

import com.storks.livemessaging.model.types.PaymentMethod;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.security.Timestamp;
import java.util.List;

@Entity
@Getter
@Setter
@DiscriminatorValue("PARENT")
@Table(name = "parents")
public class Parent extends User{

    @Column(nullable = false)
    private PhoneNumber contactPrimaryNumber;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "parent_secondary_phones", joinColumns = @JoinColumn(name = "parent_id"))
    private List<PhoneNumber> secondaryPhoneNumbers;

    @Enumerated(EnumType.STRING)
    private PaymentMethod paymentPreferred;

    @OneToMany(mappedBy = "parent",  cascade = CascadeType.ALL,  orphanRemoval = true)
    private List<Card> cards;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<Child> children;

    public Parent() {}
}
