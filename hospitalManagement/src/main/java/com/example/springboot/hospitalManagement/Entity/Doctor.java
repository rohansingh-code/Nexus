package com.example.springboot.hospitalManagement.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Doctor {


    @Id
    private Long id;

    @MapsId
    @OneToOne
    private User user;


    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String specialization;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private Integer experienceYears;

    @Column(length = 255)
    private String qualifications; // MBBS, MD etc.

    @Column(columnDefinition = "TEXT")
    private String bio;


    @Column(nullable = false)
    private LocalTime shiftStart;

    @Column(nullable = false)
    private LocalTime shiftEnd;

    @Builder.Default
    @ElementCollection(targetClass = DayOfWeek.class)
    @Enumerated(EnumType.STRING)
    @CollectionTable(
            name = "doctor_work_days",
            joinColumns = @JoinColumn(name = "doctor_id")
    )
    @Column(name = "work_day")
    private Set<DayOfWeek> workDays = new HashSet<>();

    @Builder.Default
    @OneToMany(mappedBy = "doctor")
    private List<Appointment> appointments = new ArrayList<>();
}