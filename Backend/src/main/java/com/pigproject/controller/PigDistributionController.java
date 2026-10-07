package com.pigproject.controller;

import com.pigproject.dto.ApiResponse;
import com.pigproject.entity.PigDistribution;
import com.pigproject.service.PigDistributionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/distributions")
public class PigDistributionController {

    @Autowired
    private PigDistributionService distributionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<List<PigDistribution>>> getAllDistributions() {
        List<PigDistribution> distributions = distributionService.getAllDistributions();
        return ResponseEntity.ok(new ApiResponse<>(true, "Distributions fetched successfully", distributions));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<PigDistribution>> createDistribution(@RequestBody PigDistribution distribution) {
        PigDistribution savedDistribution = distributionService.createDistribution(distribution);
        return ResponseEntity.ok(new ApiResponse<>(true, "Pig distributed successfully", savedDistribution));
    }
}
