
package com.storks.matching.repository;

import com.storks.matching.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByGroupId(Long groupId);
}