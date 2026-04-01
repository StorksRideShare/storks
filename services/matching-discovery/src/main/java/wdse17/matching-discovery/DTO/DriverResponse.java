package wdse17.matching.discovery.dto;

import lombok.*;
import java.util.List;

@Data
@AllArgsConstructor
public class DriverResponse {

    private Long id;
    private String name;
    private double rating;
    private int experienceYears;
    private int safeTrips;

    private String vehicleName;
    private String vehicleNumber;

    private List<String> destinations;
}