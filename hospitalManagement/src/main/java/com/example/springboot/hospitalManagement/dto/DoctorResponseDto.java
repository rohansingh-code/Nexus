package com.example.springboot.hospitalManagement.dto;

import lombok.*;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorResponseDto {

    private Long id;
    private String name;
    private String specialization;
    private String email;

    private Integer experienceYears;
    private String qualifications;
    private String bio;

}