package com.pigproject.controller;

import com.pigproject.dto.ApiResponse;
import com.pigproject.entity.Beneficiary;
import com.pigproject.service.BeneficiaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
public class BeneficiaryController {

    @Autowired
    private BeneficiaryService beneficiaryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER', 'VETERINARIAN', 'FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<List<Beneficiary>>> getAllBeneficiaries() {
        List<Beneficiary> beneficiaries = beneficiaryService.getAllBeneficiaries();
        return ResponseEntity.ok(new ApiResponse<>(true, "Beneficiaries fetched successfully", beneficiaries));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER', 'VETERINARIAN', 'FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<Beneficiary>> getBeneficiaryById(@PathVariable Long id) {
        return beneficiaryService.getBeneficiaryById(id)
                .map(beneficiary -> ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", beneficiary)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<Beneficiary>> createBeneficiary(@RequestBody Beneficiary beneficiary) {
        Beneficiary savedBeneficiary = beneficiaryService.createBeneficiary(beneficiary);
        return ResponseEntity.ok(new ApiResponse<>(true, "Beneficiary created successfully", savedBeneficiary));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<Beneficiary>> updateBeneficiary(@PathVariable Long id, @RequestBody Beneficiary beneficiary) {
        Beneficiary updatedBeneficiary = beneficiaryService.updateBeneficiary(id, beneficiary);
        return ResponseEntity.ok(new ApiResponse<>(true, "Beneficiary updated successfully", updatedBeneficiary));
    }
}
