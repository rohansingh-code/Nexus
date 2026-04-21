package com.example.springboot.hospitalManagement.service;

import com.example.springboot.hospitalManagement.dto.PatientResponseDto;

import java.util.List;

public interface PatientService {
    PatientResponseDto getPatientById(Long patientId);
    List<PatientResponseDto> getAllPatients(Integer pageNumber,Integer pageSize);
}
