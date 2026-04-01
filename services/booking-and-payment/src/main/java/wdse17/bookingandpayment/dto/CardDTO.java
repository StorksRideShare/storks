package wdse17.bookingandpayment.dto;

import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardDTO {
    private UUID cardId;
    private String cardNumber;
    private String cardHolderName;
    private Boolean isPrimary;
}
