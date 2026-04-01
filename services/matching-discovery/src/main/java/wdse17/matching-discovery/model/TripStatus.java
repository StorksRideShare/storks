package wdse17.matching.discovery.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TripStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double latitude;
    private double longitude;

    private String status; // ARRIVING, PIN, PICKUP, DROPOFF, ABSENT

    private String message; // "Arriving in 5 minutes"

    private String driverName;
    private String vehicle;
    private String plate;

    // getters & setters
}