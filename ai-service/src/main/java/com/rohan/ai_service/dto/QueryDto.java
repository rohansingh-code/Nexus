package com.rohan.ai_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QueryDto {

    @NotBlank
    private String message;

    @NotBlank
    private String sessionId;
}