package wdse17.saftyandverification.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import wdse17.saftyandverification.utils.PinGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ride_verifications")
public class OtpPin {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(nullable = false, updatable = false,  columnDefinition = "uuid")
    private UUID id;
    @Setter
    @Getter
    String otpPin;
    @Setter
    @Getter
    String parentId;
    @Setter
    @Getter
    String driverId;
    @Setter
    @Getter
    LocalDateTime requestedTime;
    @Getter
    @Setter
    LocalDateTime verifiedTime;

    public OtpPin(String parentId) {
        PinGenerator pinGenerator = new PinGenerator();
        this.otpPin = pinGenerator.generateOtp();
        this.parentId = parentId;
        this.requestedTime = LocalDateTime.now();
    }

    public OtpPin() {}
}



