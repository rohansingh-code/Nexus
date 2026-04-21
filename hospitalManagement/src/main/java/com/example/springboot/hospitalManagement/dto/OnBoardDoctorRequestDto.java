package com.example.springboot.hospitalManagement.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.Set;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OnBoardDoctorRequestDto {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Doctor name is required")
    private String name;

    @NotBlank(message = "Specialization is required")
    private String specialization;

    @NotNull(message = "Experience is required")
    @Min(value = 0, message = "Experience cannot be negative")
    @Max(value = 60, message = "Experience seems unrealistic")
    private Integer experienceYears;

    @NotBlank(message = "Qualifications are required")
    private String qualifications;

    private String bio; // optional

    @NotNull(message = "Shift start time is required")
    private LocalTime shiftStart;

    @NotNull(message = "Shift end time is required")
    private LocalTime shiftEnd;

    @NotNull(message = "Work days are required")
    private Set<DayOfWeek> workDays;
}
