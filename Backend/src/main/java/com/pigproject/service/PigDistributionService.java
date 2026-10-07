package com.pigproject.service;

import com.pigproject.entity.Beneficiary;
import com.pigproject.entity.Pig;
import com.pigproject.entity.PigDistribution;
import com.pigproject.entity.PigStatus;
import com.pigproject.repository.BeneficiaryRepository;
import com.pigproject.repository.PigDistributionRepository;
import com.pigproject.repository.PigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PigDistributionService {

    @Autowired
    private PigDistributionRepository distributionRepository;

    @Autowired
    private PigRepository pigRepository;

    @Autowired
    private BeneficiaryRepository beneficiaryRepository;

    public List<PigDistribution> getAllDistributions() {
        return distributionRepository.findAll();
    }

    @Transactional
    public PigDistribution createDistribution(PigDistribution distribution) {
        Pig pig = pigRepository.findById(distribution.getPig().getId())
                .orElseThrow(() -> new RuntimeException("Pig not found"));
        
        Beneficiary beneficiary = beneficiaryRepository.findById(distribution.getBeneficiary().getId())
                .orElseThrow(() -> new RuntimeException("Beneficiary not found"));

        if (pig.getStatus() != PigStatus.AVAILABLE) {
            throw new RuntimeException("Pig is not available for distribution");
        }

        pig.setStatus(PigStatus.DISTRIBUTED);
        pig.setCurrentBeneficiary(beneficiary);
        pigRepository.save(pig);

        if (distribution.getDistributionDate() == null) {
            distribution.setDistributionDate(LocalDateTime.now());
        }
        
        distribution.setPig(pig);
        distribution.setBeneficiary(beneficiary);
        return distributionRepository.save(distribution);
    }
}
