package com.storks.livemessaging.repositories;

import com.storks.livemessaging.model.Parent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ParentRepository extends JpaRepository<Parent, UUID> {
}
