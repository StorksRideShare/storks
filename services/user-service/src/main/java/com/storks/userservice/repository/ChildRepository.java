package com.storks.userservice.repository;

import com.storks.userservice.model.Child;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChildRepository extends JpaRepository<Child, UUID> {
    List<Child> findByParent_ProviderUserId(String providerUserId);
}
