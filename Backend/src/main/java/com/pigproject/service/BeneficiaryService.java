package com.pigproject.service;

import com.pigproject.entity.Beneficiary;
import com.pigproject.repository.BeneficiaryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BeneficiaryService {

    @Autowired
    private BeneficiaryRepository beneficiaryRepository;

    public List<Beneficiary> getAllBeneficiaries() {
        return beneficiaryRepository.findAll();
    }

    public Optional<Beneficiary> getBeneficiaryById(Long id) {
        return beneficiaryRepository.findById(id);
    }

    public Beneficiary createBeneficiary(Beneficiary beneficiary) {
        if (beneficiaryRepository.findByBeneficiaryCode(beneficiary.getBeneficiaryCode()).isPresent()) {
            throw new RuntimeException("Beneficiary code must be unique");
        }
        return beneficiaryRepository.save(beneficiary);
    }

    public Beneficiary updateBeneficiary(Long id, Beneficiary updatedBeneficiary) {
        return beneficiaryRepository.findById(id).map(beneficiary -> {
            beneficiary.setFullName(updatedBeneficiary.getFullName());
            beneficiary.setPhone(updatedBeneficiary.getPhone());
            beneficiary.setDistrict(updatedBeneficiary.getDistrict());
            beneficiary.setSector(updatedBeneficiary.getSector());
            beneficiary.setCell(updatedBeneficiary.getCell());
            beneficiary.setVillage(updatedBeneficiary.getVillage());
            beneficiary.setStatus(updatedBeneficiary.getStatus());
            return beneficiaryRepository.save(beneficiary);
        }).orElseThrow(() -> new RuntimeException("Beneficiary not found with id " + id));
    }
}
