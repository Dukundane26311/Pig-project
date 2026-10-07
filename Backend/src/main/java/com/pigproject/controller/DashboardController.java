package com.pigproject.controller;

import com.pigproject.dto.ApiResponse;
import com.pigproject.entity.PigStatus;
import com.pigproject.entity.ReturnStatus;
import com.pigproject.repository.BeneficiaryRepository;
import com.pigproject.repository.PigRepository;
import com.pigproject.repository.PigReturnRepository;
import com.pigproject.service.FinanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private PigRepository pigRepository;

    @Autowired
    private BeneficiaryRepository beneficiaryRepository;

    @Autowired
    private PigReturnRepository returnRepository;

    @Autowired
    private FinanceService financeService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FIELD_OFFICER', 'VETERINARIAN', 'FINANCE_OFFICER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalPigs", pigRepository.count());
        stats.put("availablePigs", pigRepository.findByStatus(PigStatus.AVAILABLE).size());
        stats.put("distributedPigs", pigRepository.findByStatus(PigStatus.DISTRIBUTED).size());
        stats.put("returnedPigs", pigRepository.findByStatus(PigStatus.RETURNED).size());
        stats.put("sickPigs", pigRepository.findByStatus(PigStatus.SICK).size());
        stats.put("pregnantPigs", pigRepository.findByStatus(PigStatus.PREGNANT).size());

        stats.put("totalBeneficiaries", beneficiaryRepository.count());

        long completedReturns = returnRepository.findAll().stream().filter(r -> r.getStatus() == ReturnStatus.COMPLETED).count();
        long pendingReturns = returnRepository.findAll().stream().filter(r -> r.getStatus() == ReturnStatus.PENDING || r.getStatus() == ReturnStatus.PARTIAL).count();
        stats.put("completedReturns", completedReturns);
        stats.put("pendingReturns", pendingReturns);

        Map<String, BigDecimal> finance = financeService.getFinanceSummary();
        stats.put("totalIncome", finance.get("totalIncome"));
        stats.put("totalExpenses", finance.get("totalExpense"));
        stats.put("balance", finance.get("balance"));

        return ResponseEntity.ok(new ApiResponse<>(true, "Dashboard stats fetched", stats));
    }
}
