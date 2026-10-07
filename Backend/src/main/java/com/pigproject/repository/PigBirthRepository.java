package com.pigproject.repository;

import com.pigproject.entity.PigBirth;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PigBirthRepository extends JpaRepository<PigBirth, Long> {
}
