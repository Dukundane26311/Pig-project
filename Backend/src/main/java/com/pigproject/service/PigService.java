package com.pigproject.service;

import com.pigproject.entity.Pig;
import com.pigproject.repository.PigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PigService {

    @Autowired
    private PigRepository pigRepository;

    public List<Pig> getAllPigs() {
        return pigRepository.findAll();
    }

    public Optional<Pig> getPigById(Long id) {
        return pigRepository.findById(id);
    }

    public Pig createPig(Pig pig) {
        if (pigRepository.findByPigCode(pig.getPigCode()).isPresent()) {
            throw new RuntimeException("Pig code must be unique");
        }
        return pigRepository.save(pig);
    }

    public Pig updatePig(Long id, Pig updatedPig) {
        return pigRepository.findById(id).map(pig -> {
            pig.setSex(updatedPig.getSex());
            pig.setBreed(updatedPig.getBreed());
            pig.setDateOfBirth(updatedPig.getDateOfBirth());
            pig.setStatus(updatedPig.getStatus());
            pig.setSource(updatedPig.getSource());
            pig.setPurchasePrice(updatedPig.getPurchasePrice());
            return pigRepository.save(pig);
        }).orElseThrow(() -> new RuntimeException("Pig not found with id " + id));
    }
}
