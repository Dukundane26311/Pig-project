package com.pigproject.service;

import com.pigproject.entity.Pig;
import com.pigproject.entity.PigStatus;
import com.pigproject.entity.VeterinaryRecord;
import com.pigproject.repository.PigRepository;
import com.pigproject.repository.VeterinaryRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VeterinaryRecordService {

    @Autowired
    private VeterinaryRecordRepository vetRepository;

    @Autowired
    private PigRepository pigRepository;

    public List<VeterinaryRecord> getAllRecords() {
        return vetRepository.findAll();
    }

    public List<VeterinaryRecord> getRecordsByPigId(Long pigId) {
        return vetRepository.findByPigId(pigId);
    }

    @Transactional
    public VeterinaryRecord createRecord(VeterinaryRecord record) {
        Pig pig = pigRepository.findById(record.getPig().getId())
                .orElseThrow(() -> new RuntimeException("Pig not found"));
        
        if ("DEAD".equalsIgnoreCase(record.getHealthStatus())) {
            pig.setStatus(PigStatus.DEAD);
        } else if ("PREGNANT".equalsIgnoreCase(record.getPregnancyStatus())) {
            pig.setStatus(PigStatus.PREGNANT);
        } else if ("SICK".equalsIgnoreCase(record.getHealthStatus()) || "UNDER_TREATMENT".equalsIgnoreCase(record.getHealthStatus())) {
            pig.setStatus(PigStatus.SICK);
        }

        pigRepository.save(pig);
        record.setPig(pig);
        return vetRepository.save(record);
    }
}
