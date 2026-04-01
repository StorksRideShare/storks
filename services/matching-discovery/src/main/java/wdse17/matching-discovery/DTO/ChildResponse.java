package wdse17.matching.discovery.dto;

import lombok.*;

@Data
@AllArgsConstructor
public class ChildResponse {
    private Long id;
    private String name;
    private int age;
    private String pickupLocation;
    private String dropLocation;
}