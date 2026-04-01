package wdse17.bookingandpayment.dto;

import lombok.*;
import java.util.UUID;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferDTO {
    private UUID offerId;
    private String driverName;
    private String vehicleName;
    private String plate; // Already in licencePlate but naming consistent with frontend maybe?
    private Double pricePerMonth;
    private Double pricePerDay;
    private Integer seats;
    private Integer capacity;
    private List<String> features;
    private List<String> vehicleImageUrls;
    private String rating;
    private String experience;
    private String trips;
    private List<String> destinations;
    private String bookedGroupName;
    private Boolean isUsingIntelligentPricing;
}
