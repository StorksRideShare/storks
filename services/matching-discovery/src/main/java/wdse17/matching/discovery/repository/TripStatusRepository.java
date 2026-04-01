package wdse17.matching.discovery.repository;

import wdse17.matching.discovery.model.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TripStatusRepository extends JpaRepository<TripStatus, Long> {
}