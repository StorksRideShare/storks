package com.storks.matching.repository;

import com.storks.models.ChildGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface GroupRepository extends JpaRepository<ChildGroup, UUID> {}

