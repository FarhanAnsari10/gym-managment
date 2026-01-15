package com.gymmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "plan_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String memberId;
    
    @Column(nullable = false)
    private String planName;
    
    @Column(nullable = false)
    private LocalDateTime paymentDate;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid;
    
    @Column(nullable = false)
    private String paymentMethod;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal dues = BigDecimal.ZERO;
    
    @Column(nullable = false)
    private Integer planDuration;
    
    @Column(nullable = false)
    private LocalDateTime planExpireDate;
    
    @Column(nullable = false)
    private LocalDateTime planStartDate;
    
    @Column(nullable = false, unique = true)
    private String receiptId;
    
    @Column(nullable = false)
    private LocalDateTime planPurchaseDate;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
