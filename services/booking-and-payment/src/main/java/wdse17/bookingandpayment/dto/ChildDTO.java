package wdse17.bookingandpayment.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChildDTO {
    private UUID childId;
    private String firstName;
    private String lastName;
    private String preferredName;
}
