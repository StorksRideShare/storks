package wdse17.matching.discovery.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class GroupResponse {

    private String groupName;

    private String memberName;
    private int age;

    private String pickupLocation;
    private String dropLocation;

    private String driverName;
    private boolean hasDriver;

    private String status;
    private LocalDate bookingDate;
}