package com.rohan.ai_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AgentResponse {

    private String message;        // natural language text, always present
    private List<DoctorOption> doctorList;  // only present when AI found doctors
    private BookingReady bookingReady;      // only present on turn 3

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DoctorOption {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingReady {
        private Long doctorId;
        private String date;
        private String time;
        private String reason;
    }
}