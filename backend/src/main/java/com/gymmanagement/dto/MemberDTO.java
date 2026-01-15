package com.gymmanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberDTO {
    private String id;
    private String memberId;
    private String name;
    private String mobile;
    private String email;
    private String gender;
    private LocalDate dob;
    private String trainingType;
    private String address;
    private String comments;
    private String imageUrl;
    private String qrCodeUrl;
    private LocalDate joiningDate;
    private LocalDate planExpireDate;
    private boolean activeMember;
    private boolean expiredMember;
    private boolean newMember;
    private LocalDateTime createdAt;
}
