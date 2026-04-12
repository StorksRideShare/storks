package com.storks.matching.repository;

import com.storks.models.Parent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ParentRepository extends JpaRepository<Parent, UUID> {}
