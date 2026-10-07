package com.pigproject.repository;

import com.pigproject.entity.Sector;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SectorRepository extends JpaRepository<Sector, Long> {
    List<Sector> findByDistrictId(Long districtId);
}
