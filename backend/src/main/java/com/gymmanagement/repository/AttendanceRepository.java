package com.gymmanagement.repository;

import com.gymmanagement.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, String> {
    List<Attendance> findByMemberId(String memberId);
    List<Attendance> findByMemberIdAndDateBetween(String memberId, LocalDate start, LocalDate end);
    Optional<Attendance> findByMemberIdAndDate(String memberId, LocalDate date);
    List<Attendance> findByAdminIdAndDate(String adminId, LocalDate date);
    
    @Query("SELECT a FROM Attendance a WHERE a.adminId = :adminId AND a.date = :date AND a.status = :status")
    List<Attendance> findByAdminIdAndDateAndStatus(@Param("adminId") String adminId, @Param("date") LocalDate date, @Param("status") String status);
}
