package com.storks.livemessaging.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID cardId;

    @Column(nullable = false, unique = true)
    private String cardNumber;

    @Column(nullable = false)
    private String cardHolderName;

    private boolean active;
    private boolean isPrimary;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Parent parent;

    public Card() {}
}
