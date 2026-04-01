package wdse17.bookingandpayment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wdse17.bookingandpayment.entity.Booking;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    @Query("SELECT b FROM Booking b WHERE b.parentId = :parentId")
    List<Booking> findByParentId(@Param("parentId") UUID parentId);

    @Query("SELECT count(b) > 0 FROM Booking b WHERE b.childGroup.groupId = :groupId AND b.offer.offerId = :offerId AND b.isCancelled = false")
    boolean existsActiveOrPendingBooking(@Param("groupId") UUID groupId, @Param("offerId") UUID offerId);

    @Query("SELECT b FROM Booking b WHERE b.childGroup.groupId = :groupId AND b.offer.offerId = :offerId AND b.isCancelled = false")
    List<Booking> findByGroupIdAndOfferIdAndIsCancelledFalse(@Param("groupId") UUID groupId,
            @Param("offerId") UUID offerId);

    @Query("SELECT b FROM Booking b WHERE b.childGroup.groupId = :groupId AND b.isCancelled = false AND (b.isActive = true OR b.isAccepted = true) AND b.type = 'DAY' AND :checkDate BETWEEN b.startDate AND b.endDate")
    List<Booking> findActiveOrAcceptedDayBookingForGroupOnDate(@Param("groupId") UUID groupId,
            @Param("checkDate") LocalDate checkDate);
}
