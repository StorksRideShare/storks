package wdse17.matching.discovery.repository;

import wdse17.matching.discovery.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, Long> {
}