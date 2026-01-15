package com.gymmanagement.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendances", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"memberId", "date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false)
    private String adminId;
    
    @Column(nullable = false)
    private String memberId;
    
    @Column(nullable = false)
    private LocalDate date;
    
    @Column(nullable = false)
    private String status; // present, absent, holiday
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime markedAt = LocalDateTime.now();
}
