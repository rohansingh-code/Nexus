package com.example.springboot.hospitalManagement.service;

import com.example.springboot.hospitalManagement.dto.AppointmentResponseDto;
import com.example.springboot.hospitalManagement.dto.CreateAppointmentRequestDto;
import java.util.List;

public interface AppointmentService {
    AppointmentResponseDto createNewAppointment(CreateAppointmentRequestDto dto,Long userId);
    List<AppointmentResponseDto> getAllAppointmentsOfDoctor(Long doctorId);
}