package com.storks.matching.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SearchDriverResponse {

    private Long id;
    private String name;
    private String vehicle;
    private String plate;

    private int availableSeats;
    private int totalSeats;

    private boolean ac;
    private boolean nfc;

    private boolean verified;
}