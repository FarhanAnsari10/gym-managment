package com.gymmanagement.repository;

import com.gymmanagement.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findByAdminId(String adminId);
    List<Transaction> findByAdminIdOrderByPaymentDateDesc(String adminId);
    List<Transaction> findByMemberId(String memberId);
    List<Transaction> findByMemberIdOrderByPaymentDateDesc(String memberId);
    
    @Query("SELECT t FROM Transaction t WHERE t.adminId = :adminId AND YEAR(t.paymentDate) = :year AND MONTH(t.paymentDate) = :month")
    List<Transaction> findByAdminIdAndYearAndMonth(@Param("adminId") String adminId, @Param("year") int year, @Param("month") int month);
}
