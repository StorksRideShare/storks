package com.storks.matching.dto;

import java.util.UUID;
import lombok.*;

@Data
@AllArgsConstructor
public class ChildResponse {
    private UUID id;
    private String name;
    private int age;
    private String pickupLocation;
    private String dropLocation;
}


