package wdse17.saftyandverification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import wdse17.saftyandverification.model.OtpPin;

import java.util.Optional;
import java.util.UUID;

public interface OTPRepository extends JpaRepository<OtpPin, String> {
    Optional<OtpPin> findById(UUID id);
    Optional<OtpPin> findByOtpPinAndParentId(String otpPin, String parentId);
}
