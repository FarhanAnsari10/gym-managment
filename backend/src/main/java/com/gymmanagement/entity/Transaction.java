package com.gymmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String adminId;
    
    @Column(nullable = false)
    private String memberId;
    
    @Column(nullable = false)
    private String memberName;
    
    @Column(nullable = false)
    private LocalDateTime paymentDate;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid;
    
    @Column(nullable = false)
    private String paymentMethod; // Cash, UPI, Card, Other
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal dues = BigDecimal.ZERO;
    
    private String planDetail;
    
    private Integer planDuration;
    
    private LocalDateTime planExpireDate;
    
    @Column(nullable = false, unique = true)
    private String receiptId;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
