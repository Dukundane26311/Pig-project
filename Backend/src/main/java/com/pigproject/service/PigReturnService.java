package com.pigproject.service;

import com.pigproject.entity.PigReturn;
import com.pigproject.entity.ReturnStatus;
import com.pigproject.repository.PigReturnRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PigReturnService {

    @Autowired
    private PigReturnRepository returnRepository;

    public List<PigReturn> getAllReturns() {
        return returnRepository.findAll();
    }

    @Transactional
    public PigReturn recordReturn(PigReturn pigReturn) {
        PigReturn existing = null;
        if (pigReturn.getId() != null) {
            existing = returnRepository.findById(pigReturn.getId()).orElse(null);
        }

        if (existing == null) {
            pigReturn.setRemainingCount(pigReturn.getRequiredCount() - pigReturn.getReturnedCount());
            if (pigReturn.getRemainingCount() <= 0) {
                pigReturn.setRemainingCount(0);
                pigReturn.setStatus(ReturnStatus.COMPLETED);
            } else if (pigReturn.getReturnedCount() > 0) {
                pigReturn.setStatus(ReturnStatus.PARTIAL);
            }
            return returnRepository.save(pigReturn);
        } else {
            existing.setReturnedCount(existing.getReturnedCount() + pigReturn.getReturnedCount());
            existing.setRemainingCount(existing.getRequiredCount() - existing.getReturnedCount());
            
            if (existing.getRemainingCount() <= 0) {
                existing.setRemainingCount(0);
                existing.setStatus(ReturnStatus.COMPLETED);
            } else if (existing.getReturnedCount() > 0) {
                existing.setStatus(ReturnStatus.PARTIAL);
            }
            
            existing.setNotes(pigReturn.getNotes());
            return returnRepository.save(existing);
        }
    }
}
