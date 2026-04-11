package com.storks.matching.dto;

import java.util.UUID;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchDriverResponse {

    private UUID id;
    private String name;
    private String vehicle;
    private String plate;

    private int availableSeats;
    private int totalSeats;

    private boolean ac;
    private boolean nfc;

    private boolean verified;
}


