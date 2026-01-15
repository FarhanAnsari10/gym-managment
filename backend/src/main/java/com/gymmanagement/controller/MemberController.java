package com.gymmanagement.controller;

import com.gymmanagement.dto.MemberDTO;
import com.gymmanagement.dto.MemberRequest;
import com.gymmanagement.security.UserPrincipal;
import com.gymmanagement.service.MemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {
    
    @Autowired
    private MemberService memberService;
    
    @PostMapping
    public ResponseEntity<?> createMember(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                         @Valid @RequestBody MemberRequest request) {
        try {
            MemberDTO member = memberService.createMember(userPrincipal.getId(), request);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @GetMapping
    public ResponseEntity<List<MemberDTO>> getAllMembers(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<MemberDTO> members = memberService.getAllMembers(userPrincipal.getId());
        return ResponseEntity.ok(members);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getMemberById(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                          @PathVariable String id) {
        try {
            MemberDTO member = memberService.getMemberById(userPrincipal.getId(), id);
            return ResponseEntity.ok(member);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMember(@AuthenticationPrincipal UserPrincipal userPrincipal,
                                         @PathVariable String id) {
        try {
            memberService.deleteMember(userPrincipal.getId(), id);
            return ResponseEntity.ok("Member deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
