package com.storks.matching.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchDriver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String vehicle;
    private String plate;

    private int totalSeats;
    private int availableSeats;

    private boolean ac;
    private boolean nfc;

    private boolean verified;
}