package com.example.springboot.hospitalManagement.Repository;

import com.example.springboot.hospitalManagement.Entity.Appointment;
import com.example.springboot.hospitalManagement.Entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // Check if exact same time slot exists
    boolean existsByDoctorAndAppointmentTime(Doctor doctor, LocalDateTime appointmentTime);

    // Get all appointments for a doctor
    List<Appointment> findByDoctorId(Long doctorId);

    // Get all appointments for a patient
    List<Appointment> findByPatientId(Long patientId);

    // Check overlapping appointments
    @Query("""
        SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END
        FROM Appointment a
        WHERE a.doctor = :doctor
        AND a.appointmentTime < :newEnd
        AND a.appointmentEnd > :newStart
    """)
    boolean existsOverlappingAppointment(
            @Param("doctor") Doctor doctor,
            @Param("newStart") LocalDateTime newStart,
            @Param("newEnd") LocalDateTime newEnd
    );
}