
package wdse17.matching.discovery.repository;

import wdse17.matching.discovery.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByGroupId(Long groupId);
}