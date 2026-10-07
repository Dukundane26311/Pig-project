package com.pigproject.controller;

import com.pigproject.dto.ApiResponse;
import com.pigproject.entity.FinancialTransaction;
import com.pigproject.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    @Autowired
    private FinanceService financeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<List<FinancialTransaction>>> getAllTransactions() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", financeService.getAllTransactions()));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<Map<String, BigDecimal>>> getFinanceSummary() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched successfully", financeService.getFinanceSummary()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<FinancialTransaction>> createTransaction(@RequestBody FinancialTransaction transaction) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Transaction created", financeService.createTransaction(transaction)));
    }
}
