package wdse17.bookingandpayment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import wdse17.bookingandpayment.entity.Card;
import java.util.List;
import java.util.UUID;

public interface CardRepository extends JpaRepository<Card, UUID> {
    List<Card> findByParentIdAndActiveTrue(UUID parentId);
}
