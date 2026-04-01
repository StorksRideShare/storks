package wdse17.bookingandpayment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import wdse17.bookingandpayment.entity.ChildGroup;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChildGroupRepository extends JpaRepository<ChildGroup, UUID> {
    @Query("SELECT cg FROM ChildGroup cg WHERE cg.parentId = :parentId")
    List<ChildGroup> findByParentId(@Param("parentId") UUID parentId);
}
