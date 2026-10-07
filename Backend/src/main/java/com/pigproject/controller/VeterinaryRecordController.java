package com.pigproject.controller;

import com.pigproject.dto.ApiResponse;
import com.pigproject.entity.VeterinaryRecord;
import com.pigproject.service.VeterinaryRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/veterinary")
public class VeterinaryRecordController {

    @Autowired
    private VeterinaryRecordService vetService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VETERINARIAN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<List<VeterinaryRecord>>> getAllRecords() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", vetService.getAllRecords()));
    }

    @GetMapping("/pig/{pigId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VETERINARIAN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<List<VeterinaryRecord>>> getRecordsByPigId(@PathVariable Long pigId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", vetService.getRecordsByPigId(pigId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VETERINARIAN')")
    public ResponseEntity<ApiResponse<VeterinaryRecord>> createRecord(@RequestBody VeterinaryRecord record) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Record created", vetService.createRecord(record)));
    }
}
