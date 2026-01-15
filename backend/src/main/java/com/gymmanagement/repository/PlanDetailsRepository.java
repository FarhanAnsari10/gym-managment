package com.gymmanagement.repository;

import com.gymmanagement.entity.PlanDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlanDetailsRepository extends JpaRepository<PlanDetails, String> {
    Optional<PlanDetails> findByMemberId(String memberId);
}
