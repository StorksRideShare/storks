package wdse17.bookingandpayment.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingEventDTO {
    private UUID id;
    private String groupName;
    private String driverName;
    private String vehicle;
    private String plate;
    private String status;
    private String title;
    private String description;
    private String date;
    private String time;
    private String location;
}
