package com.pigproject.controller;

import com.pigproject.dto.ApiResponse;
import com.pigproject.entity.PigReturn;
import com.pigproject.service.PigReturnService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/returns")
public class PigReturnController {

    @Autowired
    private PigReturnService returnService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<List<PigReturn>>> getAllReturns() {
        List<PigReturn> returns = returnService.getAllReturns();
        return ResponseEntity.ok(new ApiResponse<>(true, "Returns fetched successfully", returns));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER')")
    public ResponseEntity<ApiResponse<PigReturn>> createOrUpdateReturn(@RequestBody PigReturn pigReturn) {
        PigReturn savedReturn = returnService.recordReturn(pigReturn);
        return ResponseEntity.ok(new ApiResponse<>(true, "Pig return recorded successfully", savedReturn));
    }
}
