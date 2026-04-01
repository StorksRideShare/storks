package wdse17.bookingandpayment.repository;

import wdse17.bookingandpayment.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByProviderUserId(String providerUserId);
    Optional<User> findByEmail(String email);
}
