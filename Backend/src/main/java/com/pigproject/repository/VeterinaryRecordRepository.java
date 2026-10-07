package com.pigproject.repository;

import com.pigproject.entity.VeterinaryRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VeterinaryRecordRepository extends JpaRepository<VeterinaryRecord, Long> {
    List<VeterinaryRecord> findByPigId(Long pigId);
}
