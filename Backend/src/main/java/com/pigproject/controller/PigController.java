package com.pigproject.controller;

import com.pigproject.dto.ApiResponse;
import com.pigproject.entity.Pig;
import com.pigproject.service.PigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pigs")
public class PigController {

    @Autowired
    private PigService pigService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER', 'VETERINARIAN', 'FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<List<Pig>>> getAllPigs() {
        List<Pig> pigs = pigService.getAllPigs();
        return ResponseEntity.ok(new ApiResponse<>(true, "Pigs fetched successfully", pigs));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER', 'VETERINARIAN', 'FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<Pig>> getPigById(@PathVariable Long id) {
        return pigService.getPigById(id)
                .map(pig -> ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", pig)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<Pig>> createPig(@RequestBody Pig pig) {
        Pig savedPig = pigService.createPig(pig);
        return ResponseEntity.ok(new ApiResponse<>(true, "Pig registered successfully", savedPig));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<Pig>> updatePig(@PathVariable Long id, @RequestBody Pig pig) {
        Pig updatedPig = pigService.updatePig(id, pig);
        return ResponseEntity.ok(new ApiResponse<>(true, "Pig updated successfully", updatedPig));
    }
}
