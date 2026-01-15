package com.gymmanagement.service;

import com.gymmanagement.dto.MemberDTO;
import com.gymmanagement.dto.MemberRequest;
import com.gymmanagement.entity.*;
import com.gymmanagement.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MemberService {
    
    @Autowired
    private MemberRepository memberRepository;
    
    @Autowired
    private PlanRepository planRepository;
    
    @Autowired
    private TransactionRepository transactionRepository;
    
    @Autowired
    private PlanDetailsRepository planDetailsRepository;
    
    @Autowired
    private FinancialSummaryRepository financialSummaryRepository;
    
    @Transactional
    public MemberDTO createMember(String adminId, MemberRequest request) {
        // Generate member ID
        String memberId = generateMemberId(adminId);
        
        // Get plan to calculate expiry date
        Plan plan = planRepository.findByAdminId(adminId).stream()
                .filter(p -> p.getName().equals(request.getGymPlan()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        
        // Calculate plan expiry date
        LocalDate planExpireDate = calculateExpiryDate(request.getJoiningDate(), request.getGymPlanDuration());
        
        // Create member
        Member member = new Member();
        member.setAdminId(adminId);
        member.setMemberId(memberId);
        member.setName(request.getName());
        member.setMobile(request.getMobile());
        member.setEmail(request.getEmail());
        member.setGender(request.getGender());
        member.setDob(request.getDob());
        member.setTrainingType(request.getTrainingType());
        member.setAddress(request.getAddress());
        member.setComments(request.getComments());
        member.setImageUrl(request.getImageUrl());
        member.setJoiningDate(request.getJoiningDate());
        member.setPlanExpireDate(planExpireDate);
        member.setActiveMember(true);
        member.setExpiredMember(false);
        member.setNewMember(true);
        
        member = memberRepository.save(member);
        
        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setAdminId(adminId);
        transaction.setMemberId(member.getId());
        transaction.setMemberName(request.getName());
        transaction.setPaymentDate(LocalDateTime.now());
        transaction.setAmountPaid(BigDecimal.valueOf(request.getPaidAmount()));
        transaction.setPaymentMethod(request.getPaymentMethod());
        transaction.setDues(BigDecimal.valueOf(request.getDues() != null ? request.getDues() : 0.0));
        transaction.setPlanDetail(request.getGymPlan());
        transaction.setPlanDuration(request.getGymPlanDuration());
        transaction.setPlanExpireDate(planExpireDate.atStartOfDay());
        transaction.setReceiptId("TXN" + System.currentTimeMillis());
        
        transactionRepository.save(transaction);
        
        // Create plan details
        PlanDetails planDetails = new PlanDetails();
        planDetails.setMemberId(member.getId());
        planDetails.setPlanName(plan.getName());
        planDetails.setPaymentDate(LocalDateTime.now());
        planDetails.setAmountPaid(BigDecimal.valueOf(request.getPaidAmount()));
        planDetails.setPaymentMethod(request.getPaymentMethod());
        planDetails.setDues(BigDecimal.valueOf(request.getDues() != null ? request.getDues() : 0.0));
        planDetails.setPlanDuration(request.getGymPlanDuration());
        planDetails.setPlanExpireDate(planExpireDate.atStartOfDay());
        planDetails.setPlanStartDate(request.getJoiningDate().atStartOfDay());
        planDetails.setReceiptId("TXN" + System.currentTimeMillis());
        planDetails.setPlanPurchaseDate(LocalDateTime.now());
        
        planDetailsRepository.save(planDetails);
        
        // Update financial summary
        updateFinancialSummary(adminId, request.getPaidAmount(), request.getDues() != null ? request.getDues() : 0.0,
                request.getAdmissionFee() != null ? request.getAdmissionFee() : 0.0);
        
        return convertToDTO(member);
    }
    
    public List<MemberDTO> getAllMembers(String adminId) {
        return memberRepository.findByAdminId(adminId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public MemberDTO getMemberById(String adminId, String memberId) {
        Member member = memberRepository.findByAdminIdAndId(adminId, memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        return convertToDTO(member);
    }
    
    @Transactional
    public void deleteMember(String adminId, String memberId) {
        Member member = memberRepository.findByAdminIdAndId(adminId, memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));
        memberRepository.delete(member);
    }
    
    private String generateMemberId(String adminId) {
        List<Member> members = memberRepository.findByAdminId(adminId);
        int maxId = 0;
        Pattern pattern = Pattern.compile("KGF-ID-(\\d+)");
        
        for (Member m : members) {
            if (m.getMemberId() != null) {
                Matcher matcher = pattern.matcher(m.getMemberId());
                if (matcher.find()) {
                    int id = Integer.parseInt(matcher.group(1));
                    if (id > maxId) maxId = id;
                }
            }
        }
        
        return "KGF-ID-" + (maxId + 1);
    }
    
    private LocalDate calculateExpiryDate(LocalDate startDate, int months) {
        LocalDate expiryDate = startDate.plusMonths(months).minusDays(1);
        return expiryDate;
    }
    
    private void updateFinancialSummary(String adminId, Double amountPaid, Double dues, Double admissionFee) {
        int year = LocalDate.now().getYear();
        int month = LocalDate.now().getMonthValue();
        
        FinancialSummary summary = financialSummaryRepository.findByAdminIdAndYear(adminId, year)
                .orElse(new FinancialSummary());
        
        if (summary.getId() == null) {
            summary.setAdminId(adminId);
            summary.setYear(year);
            summary.setMonthlyData("{}");
            summary.setYearlyIncome(BigDecimal.ZERO);
            summary.setYearlyDues(BigDecimal.ZERO);
        }
        
        // Update monthly data (simplified - would need JSON parsing in production)
        BigDecimal currentIncome = summary.getYearlyIncome().add(BigDecimal.valueOf(amountPaid));
        BigDecimal currentDues = summary.getYearlyDues().add(BigDecimal.valueOf(dues));
        
        summary.setYearlyIncome(currentIncome);
        summary.setYearlyDues(currentDues);
        
        financialSummaryRepository.save(summary);
    }
    
    private MemberDTO convertToDTO(Member member) {
        MemberDTO dto = new MemberDTO();
        dto.setId(member.getId());
        dto.setMemberId(member.getMemberId());
        dto.setName(member.getName());
        dto.setMobile(member.getMobile());
        dto.setEmail(member.getEmail());
        dto.setGender(member.getGender());
        dto.setDob(member.getDob());
        dto.setTrainingType(member.getTrainingType());
        dto.setAddress(member.getAddress());
        dto.setComments(member.getComments());
        dto.setImageUrl(member.getImageUrl());
        dto.setQrCodeUrl(member.getQrCodeUrl());
        dto.setJoiningDate(member.getJoiningDate());
        dto.setPlanExpireDate(member.getPlanExpireDate());
        dto.setActiveMember(member.isActiveMember());
        dto.setExpiredMember(member.isExpiredMember());
        dto.setNewMember(member.isNewMember());
        dto.setCreatedAt(member.getCreatedAt());
        return dto;
    }
}
