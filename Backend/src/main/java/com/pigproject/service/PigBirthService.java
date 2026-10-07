package com.pigproject.service;

import com.pigproject.entity.PigBirth;
import com.pigproject.repository.PigBirthRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PigBirthService {

    @Autowired
    private PigBirthRepository birthRepository;

    public List<PigBirth> getAllBirths() {
        return birthRepository.findAll();
    }

    public PigBirth createBirth(PigBirth birth) {
        return birthRepository.save(birth);
    }
}
