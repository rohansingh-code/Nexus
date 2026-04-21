package com.example.springboot.hospitalManagement.service;

import com.example.springboot.hospitalManagement.dto.DoctorResponseDto;
import com.example.springboot.hospitalManagement.dto.OnBoardDoctorRequestDto;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public interface DoctorService {

    List<DoctorResponseDto> getAllDoctors();

    DoctorResponseDto onBoardNewDoctor(OnBoardDoctorRequestDto onBoardDoctorRequestDto);

    List<DoctorResponseDto> getDoctorsBySpecialization(String specialization);

    List<DoctorResponseDto> getAvailableDoctors(
            String specialization,
            DayOfWeek day,
            LocalTime time,
            LocalDateTime dateTime
    );
}