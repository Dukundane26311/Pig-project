package com.pigproject.repository;

import com.pigproject.entity.Pig;
import com.pigproject.entity.PigStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface PigRepository extends JpaRepository<Pig, Long> {
    Optional<Pig> findByPigCode(String pigCode);
    List<Pig> findByStatus(PigStatus status);
}
