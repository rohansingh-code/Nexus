package com.example.springboot.hospitalManagement.service.impl;

import com.example.springboot.hospitalManagement.Entity.Appointment;
import com.example.springboot.hospitalManagement.Entity.Doctor;
import com.example.springboot.hospitalManagement.Entity.Patient;
import com.example.springboot.hospitalManagement.Repository.AppointmentRepository;
import com.example.springboot.hospitalManagement.Repository.DoctorRepository;
import com.example.springboot.hospitalManagement.Repository.PatientRepository;
import com.example.springboot.hospitalManagement.dto.AppointmentResponseDto;
import com.example.springboot.hospitalManagement.dto.CreateAppointmentRequestDto;
import com.example.springboot.hospitalManagement.error.SlotUnavailableException;
import com.example.springboot.hospitalManagement.service.AppointmentService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final ModelMapper modelMapper;

    @Transactional
    @Override
    public AppointmentResponseDto createNewAppointment(CreateAppointmentRequestDto dto, Long patientIdFromSecurity) {
        log.info("Booking request for Doctor ID: {} by secure Patient ID: {}", dto.getDoctorId(), patientIdFromSecurity);

        // 1. Load Entities
        // Load doctor from DTO
        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));


        Patient patient = patientRepository.findById(patientIdFromSecurity)
                .orElseThrow(() -> new EntityNotFoundException("Patient not found"));

        LocalDateTime requestedTime = dto.getAppointmentTime();

        // 2. Validation: Check Work Day
        DayOfWeek requestedDay = requestedTime.getDayOfWeek();
        if (!doctor.getWorkDays().contains(requestedDay)) {
            throw new IllegalStateException("Doctor " + doctor.getName() + " does not work on " + requestedDay);
        }

        // 3. Validation: Check Shift Hours
        LocalTime timeOnly = requestedTime.toLocalTime();
        if (timeOnly.isBefore(doctor.getShiftStart()) || timeOnly.isAfter(doctor.getShiftEnd())) {
            throw new IllegalStateException("Requested time " + timeOnly + " is outside the doctor's shift (" 
                    + doctor.getShiftStart() + " - " + doctor.getShiftEnd() + ")");
        }

        // 4. Validation: Check if the slot is already taken (Duplicate Check)
        if (appointmentRepository.existsByDoctorAndAppointmentTime(doctor, requestedTime)) {
            throw new SlotUnavailableException("The doctor is already booked for this time slot.");
        }

        // 5. Create Appointment
        Appointment appointment = Appointment.builder()
                .reason(dto.getReason())
                .appointmentTime(requestedTime)
                .doctor(doctor)
                .patient(patient)
                .build();

        // 6. Save and Sync relationships
        appointment = appointmentRepository.save(appointment);
        
        // Update bidirectional relationships in current persistence context
        doctor.getAppointments().add(appointment);
        patient.getAppointments().add(appointment);

        log.info("Successfully created appointment ID: {} for secure Patient: {}", appointment.getId(), patientIdFromSecurity);
        return modelMapper.map(appointment, AppointmentResponseDto.class);
    }

    @Override
    public List<AppointmentResponseDto> getAllAppointmentsOfDoctor(Long doctorId) {
        log.info("Fetching all appointments for doctor ID: {}", doctorId);
        
        if (!doctorRepository.existsById(doctorId)) {
            throw new EntityNotFoundException("Doctor not found");
        }

        return appointmentRepository.findByDoctorId(doctorId).stream()
                .map(app -> modelMapper.map(app, AppointmentResponseDto.class))
                .toList();
    }
}