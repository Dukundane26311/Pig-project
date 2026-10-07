package com.pigproject.repository;

import com.pigproject.entity.Village;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface VillageRepository extends JpaRepository<Village, Long> {
    List<Village> findByCellId(Long cellId);
}
