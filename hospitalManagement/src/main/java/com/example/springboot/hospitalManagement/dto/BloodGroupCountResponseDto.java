package com.example.springboot.hospitalManagement.dto;

import com.example.springboot.hospitalManagement.Entity.type.BloodGroupType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Data
@ToString
public class BloodGroupCountResponseDto {

    private BloodGroupType bloodGroupType;
    private Long count;
}
