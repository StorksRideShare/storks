package com.storks.matching.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchDriver {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String vehicle;
    private String plate;

    private int totalSeats;
    private int availableSeats;

    private boolean ac;
    private boolean nfc;

    private boolean verified;
}
