package com.example.springboot.hospitalManagement.Repository;

import com.example.springboot.hospitalManagement.Entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    List<Doctor> findAll();

    List<Doctor> findBySpecializationIgnoreCase(String specialization);

    @Query("""
        SELECT d FROM Doctor d
        WHERE LOWER(d.specialization) = LOWER(:specialization)
        AND :day MEMBER OF d.workDays
        AND d.shiftStart <= :time
        AND d.shiftEnd > :time
        AND d.id NOT IN (
            SELECT a.doctor.id
            FROM Appointment a
            WHERE a.appointmentTime = :fullDateTime
        )
    """)
    List<Doctor> findAvailableDoctors(
            @Param("specialization") String specialization,
            @Param("day") DayOfWeek day,
            @Param("time") LocalTime time,
            @Param("fullDateTime") LocalDateTime fullDateTime
    );
}