package com.example.springboot.hospitalManagement.controller;

import com.example.springboot.hospitalManagement.dto.DoctorResponseDto;
import com.example.springboot.hospitalManagement.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/public")
@RequiredArgsConstructor
public class HospitalController {

    private final DoctorService doctorService;

    @GetMapping("/doctors")
    public ResponseEntity<List<DoctorResponseDto>> getDoctors(
            @RequestParam(required = false) String specialization
    ) {
        if (specialization != null) {
            return ResponseEntity.ok(
                    doctorService.getDoctorsBySpecialization(specialization)
            );
        }
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/doctors/available")
    public ResponseEntity<List<DoctorResponseDto>> getAvailableDoctors(
            @RequestParam String specialization,
            @RequestParam String dateTime     // expects "2026-04-19T15:00:00"
    ) {
        LocalDateTime dt = LocalDateTime.parse(dateTime);
        DayOfWeek day = dt.getDayOfWeek();
        LocalTime time = dt.toLocalTime();

        return ResponseEntity.ok(
                doctorService.getAvailableDoctors(specialization, day, time, dt)
        );
    }
}