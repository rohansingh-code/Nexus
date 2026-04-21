package com.rohan.ai_service.tools;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
public class HospitalTools {

    @Value("${hospital.service.url:http://hospital-service:8080}")
    private String hospitalServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Tool(description = """
            Find doctors available for a given specialization, date and time.
            Use this after you know the specialization AND the patient's preferred date and time.
            Parameters:
              - specialization: exact professional title e.g. Cardiologist, Dermatologist, Neurologist
              - dateTime: ISO format e.g. 2026-04-19T15:00:00
            Returns only doctors who are on shift and have no conflicting appointments.
            If the list is empty, tell the user no doctors are free at that time and ask for a different slot.
            """)
    public String getAvailableDoctors(String specialization, String dateTime) {
        String url = hospitalServiceUrl
                + "/api/v1/public/doctors/available?specialization="
                + specialization + "&dateTime=" + dateTime;

        log.info("Tool: getAvailableDoctors → specialization={}, dateTime={}", specialization, dateTime);
        long start = System.currentTimeMillis();
        try {
            String result = restTemplate.getForObject(url, String.class);
            log.info("Tool completed in {} ms", System.currentTimeMillis() - start);
            return result;
        } catch (Exception e) {
            log.error("Tool failed after {} ms: {}", System.currentTimeMillis() - start, e.getMessage());
            return "Unable to fetch available doctors at this time. Please try again.";
        }
    }
}