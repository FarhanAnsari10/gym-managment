package com.gymmanagement.controller;

import com.gymmanagement.dto.PlanDTO;
import com.gymmanagement.security.UserPrincipal;
import com.gymmanagement.service.PlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")
public class PlanController {
    
    @Autowired
    private PlanService planService;
    
    @PostMapping
    public ResponseEntity<?> createPlan(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                       @RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            BigDecimal price = BigDecimal.valueOf(((Number) request.get("price")).doubleValue());
            Integer duration = ((Number) request.get("duration")).intValue();
            
            PlanDTO plan = planService.createPlan(userPrincipal.getId(), name, price, duration);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<PlanDTO>> getAllPlans(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<PlanDTO> plans = planService.getAllPlans(userPrincipal.getId());
        return ResponseEntity.ok(plans);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlan(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                       @PathVariable String id,
                                       @RequestBody Map<String, Object> request) {
        try {
            String name = (String) request.get("name");
            BigDecimal price = BigDecimal.valueOf(((Number) request.get("price")).doubleValue());
            Integer duration = ((Number) request.get("duration")).intValue();
            
            PlanDTO plan = planService.updatePlan(userPrincipal.getId(), id, name, price, duration);
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                       @PathVariable String id) {
        try {
            planService.deletePlan(userPrincipal.getId(), id);
            return ResponseEntity.ok("Plan deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
