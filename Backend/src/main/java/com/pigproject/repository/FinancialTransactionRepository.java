package com.pigproject.repository;

import com.pigproject.entity.FinancialTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;

public interface FinancialTransactionRepository extends JpaRepository<FinancialTransaction, Long> {
    
    @Query("SELECT SUM(f.amount) FROM FinancialTransaction f WHERE f.type = 'INCOME'")
    BigDecimal getTotalIncome();
    
    @Query("SELECT SUM(f.amount) FROM FinancialTransaction f WHERE f.type = 'EXPENSE'")
    BigDecimal getTotalExpense();
}
