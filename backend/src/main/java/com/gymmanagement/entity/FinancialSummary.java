package com.gymmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_summaries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String adminId;
    
    @Column(nullable = false)
    private Integer year;
    
    @Column(columnDefinition = "TEXT")
    private String monthlyData; // JSON format: {"01":{"income":1000,"dues":200,"admissionFee":50},...}
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal yearlyIncome = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal yearlyDues = BigDecimal.ZERO;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
