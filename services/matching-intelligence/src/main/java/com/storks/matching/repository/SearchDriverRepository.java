package com.storks.matching.repository;

import com.storks.matching.model.SearchDriver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchDriverRepository extends JpaRepository<SearchDriver, Long> {
}