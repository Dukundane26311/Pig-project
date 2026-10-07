package com.pigproject.controller;

import com.pigproject.dto.ApiResponse;
import com.pigproject.entity.PigBirth;
import com.pigproject.service.PigBirthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/births")
public class PigBirthController {

    @Autowired
    private PigBirthService birthService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER', 'VETERINARIAN')")
    public ResponseEntity<ApiResponse<List<PigBirth>>> getAllBirths() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", birthService.getAllBirths()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<PigBirth>> createBirth(@RequestBody PigBirth birth) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Birth recorded", birthService.createBirth(birth)));
    }
}
