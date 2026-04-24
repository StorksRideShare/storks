package com.storks.userservice.repository;

import com.storks.models.ChildGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChildGroupRepository extends JpaRepository<ChildGroup, UUID> {
    List<ChildGroup> findByParentUserId(UUID userId);
}
