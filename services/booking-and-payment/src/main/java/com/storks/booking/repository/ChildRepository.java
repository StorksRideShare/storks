package com.storks.booking.repository;

import com.storks.models.Child;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface ChildRepository extends JpaRepository<Child, UUID> {}
