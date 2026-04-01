package wdse17.matching.discovery.repository;

import wdse17.matching.discovery.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {
}