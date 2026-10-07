package com.pigproject.repository;

import com.pigproject.entity.PigDistribution;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PigDistributionRepository extends JpaRepository<PigDistribution, Long> {
}
