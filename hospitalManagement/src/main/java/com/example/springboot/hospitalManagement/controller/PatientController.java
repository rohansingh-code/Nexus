package com.example.springboot.hospitalManagement.controller;

import com.example.springboot.hospitalManagement.Entity.User;
import com.example.springboot.hospitalManagement.dto.AppointmentResponseDto;
import com.example.springboot.hospitalManagement.dto.CreateAppointmentRequestDto;
import com.example.springboot.hospitalManagement.dto.PatientResponseDto;
import com.example.springboot.hospitalManagement.service.AppointmentService;
import com.example.springboot.hospitalManagement.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;
    private final AppointmentService appointmentService;

    @PostMapping("/appointments")
    public ResponseEntity<AppointmentResponseDto> createNewAppointment(
            @Valid @RequestBody CreateAppointmentRequestDto dto) {

 
        User user = (User) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        // Pass the DTO and the secure Patient ID to the service
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(appointmentService.createNewAppointment(dto, user.getId()));
    }

    @GetMapping("/profile")
    public ResponseEntity<PatientResponseDto> getPatientInfo() {
        User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return ResponseEntity.ok(patientService.getPatientById(user.getId()));
    }
}