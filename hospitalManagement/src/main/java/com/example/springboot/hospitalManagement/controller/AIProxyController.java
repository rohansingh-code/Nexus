package com.example.springboot.hospitalManagement.controller;

import com.example.springboot.hospitalManagement.dto.QueryDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIProxyController {

    private final RestTemplate restTemplate;

    @Value("${ai.service.url:http://host.docker.internal:8081}")
    private String aiServiceUrl;

    @PostMapping("/query")
    public ResponseEntity<?> queryAI(@RequestBody QueryDto dto,
                                     @RequestHeader(value = "Authorization", required = false) String token) {
        String url = aiServiceUrl + "/ai/query";
        try {
            log.info("Calling AI service at {}", url);
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            if (token != null) headers.set("Authorization", token);
            org.springframework.http.HttpEntity<QueryDto> entity =
                    new org.springframework.http.HttpEntity<>(dto, headers);

            Object aiResponse = restTemplate.postForObject(url, entity, Object.class);
            log.info("AI service returned successfully.");
            return ResponseEntity.ok(aiResponse);
        } catch (Exception e) {
            log.error("Error communicating with AI service: {}", e.getMessage(), e);
            return ResponseEntity.ok(Map.of(
                    "error", true,
                    "message", "AI assistant is currently unavailable. If this is an emergency, call emergency services immediately."
            ));
        }
    }

    @PostMapping("/test-query")
    public ResponseEntity<?> testQuery(@RequestBody Map<String, String> body,
                                       @RequestHeader(value = "Authorization", required = false) String token) {
        String url = aiServiceUrl + "/ai/query";
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            if (token != null) headers.set("Authorization", token);
            org.springframework.http.HttpEntity<Map<String, String>> entity =
                    new org.springframework.http.HttpEntity<>(body, headers);

            Object response = restTemplate.postForObject(url, entity, Object.class);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Test query to AI service failed: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Error calling AI service: " + e.getMessage());
        }
    }
}