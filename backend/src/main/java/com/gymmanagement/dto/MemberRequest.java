package com.gymmanagement.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberRequest {
    @NotBlank(message = "Name is required")
    @Size(min = 3, message = "Name must be at least 3 characters")
    private String name;
    
    @NotBlank(message = "Mobile is required")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile must be 10 digits")
    private String mobile;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Gender is required")
    private String gender;
    
    @NotNull(message = "Date of birth is required")
    private LocalDate dob;
    
    @NotBlank(message = "Training type is required")
    private String trainingType;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    private String comments;
    
    private String imageUrl;
    
    @NotBlank(message = "Gym plan is required")
    private String gymPlan;
    
    @NotNull(message = "Plan duration is required")
    private Integer gymPlanDuration;
    
    @NotNull(message = "Admission fee is required")
    @DecimalMin(value = "0.0", message = "Admission fee must be >= 0")
    private Double admissionFee;
    
    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;
    
    @NotNull(message = "Paid amount is required")
    @DecimalMin(value = "0.0", message = "Paid amount must be >= 0")
    private Double paidAmount;
    
    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
    
    private Double dues = 0.0;
}
