package com.gymmanagement.repository;

import com.gymmanagement.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, String> {
    List<Member> findByAdminId(String adminId);
    List<Member> findByAdminIdAndActiveMember(String adminId, boolean activeMember);
    List<Member> findByAdminIdAndExpiredMember(String adminId, boolean expiredMember);
    List<Member> findByAdminIdAndNewMember(String adminId, boolean newMember);
    Optional<Member> findByAdminIdAndMemberId(String adminId, String memberId);
    Optional<Member> findByAdminIdAndId(String adminId, String id);
    Member findTopByAdminIdOrderByCreatedAtDesc(String adminId);
}
