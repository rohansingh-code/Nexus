package com.example.springboot.hospitalManagement.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponseDto {
    private Long id;
    private LocalDateTime appointmentTime;
    private LocalDateTime appointmentEnd;
    private String reason;
    private DoctorResponseDto doctor;
}