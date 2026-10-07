package com.pigproject.service;

import com.pigproject.entity.FinancialTransaction;
import com.pigproject.repository.FinancialTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FinanceService {

    @Autowired
    private FinancialTransactionRepository financeRepository;

    public List<FinancialTransaction> getAllTransactions() {
        return financeRepository.findAll();
    }

    public FinancialTransaction createTransaction(FinancialTransaction transaction) {
        if (transaction.getAmount() == null || transaction.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Financial amount must be positive");
        }
        return financeRepository.save(transaction);
    }

    public Map<String, BigDecimal> getFinanceSummary() {
        BigDecimal income = financeRepository.getTotalIncome();
        if (income == null) income = BigDecimal.ZERO;

        BigDecimal expense = financeRepository.getTotalExpense();
        if (expense == null) expense = BigDecimal.ZERO;

        BigDecimal balance = income.subtract(expense);

        Map<String, BigDecimal> summary = new HashMap<>();
        summary.put("totalIncome", income);
        summary.put("totalExpense", expense);
        summary.put("balance", balance);

        return summary;
    }
}
