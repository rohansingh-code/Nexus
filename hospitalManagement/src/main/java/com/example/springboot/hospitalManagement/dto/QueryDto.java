package com.example.springboot.hospitalManagement.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueryDto {
    private String message;

    @NotBlank
    private String sessionId;
}