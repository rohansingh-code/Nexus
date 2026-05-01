package com.rohan.ai_service.controller;

import com.rohan.ai_service.dto.AgentResponse;
import com.rohan.ai_service.dto.QueryDto;
import com.rohan.ai_service.service.AgentService;
import com.rohan.ai_service.util.AuthContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;

@PostMapping("/query")
public ResponseEntity<AgentResponse> query(
        @Valid @RequestBody QueryDto request,
        @RequestHeader(value = "Authorization", required = false) String token) {
    try {
        if (token != null) AuthContext.setToken(token);
        AgentResponse response = agentService.runAgent(request);
        return ResponseEntity.ok(response);
    } finally {
        AuthContext.clear();
    }
}


    @DeleteMapping("/session/{sessionId}")
    public ResponseEntity<Void> clearSession(@PathVariable String sessionId) {
        agentService.clearSession(sessionId);
        return ResponseEntity.noContent().build();
    }
}