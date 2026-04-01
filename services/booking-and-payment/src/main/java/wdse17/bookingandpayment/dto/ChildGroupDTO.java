package wdse17.bookingandpayment.dto;

import lombok.*;
import java.util.UUID;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChildGroupDTO {
    private UUID groupId;
    private String groupName; // e.g., Concatenated children names
    private List<ChildDTO> children;
    private String defaultDropLocation;
}
