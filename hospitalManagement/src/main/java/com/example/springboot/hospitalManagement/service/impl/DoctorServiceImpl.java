package com.example.springboot.hospitalManagement.service.impl;

import com.example.springboot.hospitalManagement.Entity.Doctor;
import com.example.springboot.hospitalManagement.Entity.User;
import com.example.springboot.hospitalManagement.Entity.type.RoleType;
import com.example.springboot.hospitalManagement.Repository.DoctorRepository;
import com.example.springboot.hospitalManagement.Repository.UserRepository;
import com.example.springboot.hospitalManagement.dto.DoctorResponseDto;
import com.example.springboot.hospitalManagement.dto.OnBoardDoctorRequestDto;
import com.example.springboot.hospitalManagement.service.DoctorService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final ModelMapper modelMapper;
    private final UserRepository userRepository;

    @Override
    public List<DoctorResponseDto> getAllDoctors() {
        return doctorRepository.findAll()
                .stream()
                .map(doctor -> modelMapper.map(doctor, DoctorResponseDto.class))
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public DoctorResponseDto onBoardNewDoctor(OnBoardDoctorRequestDto onBoardDoctorRequestDto) {

        User user = userRepository
                .findById(onBoardDoctorRequestDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "User not found with ID: " + onBoardDoctorRequestDto.getUserId()
                ));

        if (doctorRepository.existsById(onBoardDoctorRequestDto.getUserId())) {
            throw new IllegalArgumentException("Already a doctor");
        }

        Doctor doctor = Doctor.builder()
                .name(onBoardDoctorRequestDto.getName())
                .specialization(onBoardDoctorRequestDto.getSpecialization())
                .experienceYears(onBoardDoctorRequestDto.getExperienceYears())
                .qualifications(onBoardDoctorRequestDto.getQualifications())
                .bio(onBoardDoctorRequestDto.getBio())
                .shiftStart(onBoardDoctorRequestDto.getShiftStart())
                .shiftEnd(onBoardDoctorRequestDto.getShiftEnd())
                .workDays(onBoardDoctorRequestDto.getWorkDays())
                .email(user.getUsername())
                .user(user)
                .build();

        user.getRoles().add(RoleType.DOCTOR);

        return modelMapper.map(
                doctorRepository.save(doctor),
                DoctorResponseDto.class
        );
    }

    @Override
    public List<DoctorResponseDto> getDoctorsBySpecialization(String specialization) {

        log.info("Fetching doctors with specialization: {}", specialization);

        return doctorRepository.findBySpecializationIgnoreCase(specialization)
                .stream()
                .map(doctor -> modelMapper.map(doctor, DoctorResponseDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<DoctorResponseDto> getAvailableDoctors(
            String specialization,
            DayOfWeek day,
            LocalTime time,
            LocalDateTime dateTime
    ) {

        log.info(
                "Fetching available doctors — specialization: {}, day: {}, time: {}, dateTime: {}",
                specialization, day, time, dateTime
        );

        return doctorRepository
                .findAvailableDoctors(specialization, day, time, dateTime)
                .stream()
                .map(doctor -> modelMapper.map(doctor, DoctorResponseDto.class))
                .collect(Collectors.toList());
    }
}