package com.storks.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.storks.entity.Child;

/**
 * Repository interface for Child entity.
 * Provides basic CRUD operations via JpaRepository
 * and custom query methods when needed.
 */
@Repository
public interface ChildRepository extends JpaRepository<Child, UUID> {

    Optional<Child> findByName(String name);

    /**
     * Find children by parent ID.
     * Very common query when showing parent's children list.
     */
    List<Child> findByParentId(UUID parentId);

    /**
     * Find all children in a specific group (school group / ride group).
     */
    List<Child> findByGroupId(UUID groupId);

    /**
     * Find children by school name (case-insensitive partial match).
     */
    List<Child> findBySchoolContainingIgnoreCase(String schoolName);

    /**
     * Check if a child with this name already exists for a specific parent
     * (helps prevent duplicate children entries).
     */
    boolean existsByNameAndParentId(String name, UUID parentId);

}