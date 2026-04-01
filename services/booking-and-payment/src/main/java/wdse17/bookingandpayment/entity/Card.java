package wdse17.bookingandpayment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {
    @Id
    @Column(name = "card_id")
    private UUID cardId;

    @Column(name = "card_number", nullable = false, unique = true)
    private String cardNumber;

    @Column(name = "card_holder_name", nullable = false)
    private String cardHolderName;

    @Column(name = "active", nullable = false)
    private Boolean active;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary;

    @Column(name = "parent_id")
    private UUID parentId;
}
