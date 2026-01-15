package com.gymmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "members")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String adminId;
    
    @Column(nullable = false, unique = true)
    private String memberId; // KGF-ID-{number}
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String mobile;
    
    @Column(nullable = false)
    private String email;
    
    private String gender;
    
    private LocalDate dob;
    
    private String trainingType;
    
    private String address;
    
    private String comments;
    
    private String imageUrl;
    
    private String qrCodeUrl;
    
    @Column(nullable = false)
    private LocalDate joiningDate;
    
    private LocalDate planExpireDate;
    
    private boolean activeMember = true;
    
    private boolean expiredMember = false;
    
    private boolean newMember = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
