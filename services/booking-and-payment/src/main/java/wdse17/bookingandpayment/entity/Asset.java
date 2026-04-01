package wdse17.bookingandpayment.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Asset {
    @Id
    @Column(name = "asset_id")
    private UUID assetId;

    @Column(name = "type")
    private String type;

    @Column(name = "asset_url")
    private String assetUrl;
}
