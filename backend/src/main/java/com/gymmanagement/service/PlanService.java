package com.gymmanagement.service;

import com.gymmanagement.dto.PlanDTO;
import com.gymmanagement.entity.Plan;
import com.gymmanagement.repository.PlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanService {
    
    @Autowired
    private PlanRepository planRepository;
    
    public PlanDTO createPlan(String adminId, String name, BigDecimal price, Integer duration) {
        Plan plan = new Plan();
        plan.setAdminId(adminId);
        plan.setName(name);
        plan.setPrice(price);
        plan.setDuration(duration);
        
        plan = planRepository.save(plan);
        return convertToDTO(plan);
    }
    
    public List<PlanDTO> getAllPlans(String adminId) {
        return planRepository.findByAdminId(adminId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public PlanDTO updatePlan(String adminId, String planId, String name, BigDecimal price, Integer duration) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        
        if (!plan.getAdminId().equals(adminId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        plan.setName(name);
        plan.setPrice(price);
        plan.setDuration(duration);
        
        plan = planRepository.save(plan);
        return convertToDTO(plan);
    }
    
    @Transactional
    public void deletePlan(String adminId, String planId) {
        Plan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        
        if (!plan.getAdminId().equals(adminId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        planRepository.delete(plan);
    }
    
    private PlanDTO convertToDTO(Plan plan) {
        PlanDTO dto = new PlanDTO();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setPrice(plan.getPrice());
        dto.setDuration(plan.getDuration());
        return dto;
    }
}
