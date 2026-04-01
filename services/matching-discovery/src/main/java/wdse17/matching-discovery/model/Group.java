package wdse17.matching.discovery.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String groupName;

    private String memberName;
    private int age;

    private String pickupLocation;
    private String dropLocation;

    @OneToMany(mappedBy = "group", cascade = CascadeType.ALL)
     private java.util.List<Child> children;

    // 🔥 IMPORTANT: driver can be null
    private String driverName;

    // 🔥 NEW FIELDS
    private LocalDate bookingDate;
    private String status; // BOOKED / ACTIVE / COMPLETED
}