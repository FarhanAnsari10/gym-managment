package com.gymmanagement.repository;

import com.gymmanagement.entity.FinancialSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FinancialSummaryRepository extends JpaRepository<FinancialSummary, String> {
    Optional<FinancialSummary> findByAdminIdAndYear(String adminId, Integer year);
}
