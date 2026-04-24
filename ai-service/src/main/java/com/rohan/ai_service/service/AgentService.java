package com.rohan.ai_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rohan.ai_service.dto.AgentResponse;
import com.rohan.ai_service.dto.QueryDto;
import com.rohan.ai_service.store.ConversationStore;
import com.rohan.ai_service.tools.HospitalTools;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class AgentService {

    private final ChatClient chatClient;
    private final ConversationStore conversationStore;
    private final ObjectMapper objectMapper;

    private static final Pattern BOOKING_PATTERN = Pattern.compile(
            "\\[BOOKING_READY:\\s*doctorId=(\\d+),\\s*date=([\\d-]+),\\s*time=([\\d:]+),\\s*reason=([^\\]]+)\\]"
    );

    private static final Pattern DOCTORS_PATTERN = Pattern.compile(
            "\\[DOCTORS:\\s*(\\[.*?\\])\\]", Pattern.DOTALL
    );

    public AgentService(ChatClient.Builder builder,
                        HospitalTools hospitalTools,
                        ConversationStore conversationStore,
                        ObjectMapper objectMapper) {
        this.conversationStore = conversationStore;
        this.objectMapper = objectMapper;
        this.chatClient = builder
                .defaultTools(hospitalTools)
                .build();
    }

    public AgentResponse runAgent(QueryDto request) {
        String sessionId = request.getSessionId();
        String userMessage = request.getMessage();

        List<Message> history = conversationStore.getHistory(sessionId);
        history.add(new UserMessage(userMessage));

        log.info("Session {} — turn {} — running agent", sessionId, history.size());
        long start = System.currentTimeMillis();

        try {
            String raw = chatClient.prompt()
                    .system(buildSystemPrompt())
                    .messages(history)
                    .call()
                    .content();

            log.info("Session {} responded in {} ms", sessionId, System.currentTimeMillis() - start);

            conversationStore.addMessage(sessionId, "user", userMessage);
            conversationStore.addMessage(sessionId, "assistant", raw);

            return parseResponse(raw);

        } catch (Exception e) {
            log.error("Session {} failed after {} ms: {}",
                    sessionId, System.currentTimeMillis() - start, e.getMessage(), e);
            return AgentResponse.builder()
                    .message("I am experiencing technical difficulties. If this is an emergency, please call emergency services immediately.")
                    .build();
        }
    }

    private String buildSystemPrompt() {
        return """
                You are an intelligent medical assistant for a hospital system.

                Follow this exact conversation flow:

                Step 1 — When user describes symptoms:
                  - Identify the appropriate medical specialization
                  - Remember the symptoms exactly — this becomes the appointment reason
                  - Do NOT call any tool yet
                  - Ask: "What date and time works for you? (e.g. tomorrow at 3pm)"

                Step 2 — When user provides date and time:
                  - Parse it into ISO format: YYYY-MM-DDThh:mm:ss
                  - For relative dates like "tomorrow", resolve against today's date
                  - IMPORTANT: If the date is in the past, DO NOT call any tool.
                    Just reply: "That date has already passed. Could you please provide
                    a future date and time?"
                  - Only call getAvailableDoctors if the date is today or in the future
                  - If the tool returns an empty list: tell the user no doctors are
                    available at that time and ask for a different slot
                  - If doctors found: list them clearly with their id and name,
                    append on a new line:
                    [DOCTORS: [{"id":<id>,"name":"<name>"}]]

                Step 3 — When user picks a doctor:
                  - Confirm the full booking details clearly
                  - End your response with this exact tag on its own line:
                    [BOOKING_READY: doctorId=<id>, date=<YYYY-MM-DD>, time=<HH:MM>, reason=<original symptoms>]
                  - Do NOT book anything yourself.

                If symptoms sound like an emergency, say so immediately.
                Today's date is:\s""" + LocalDate.now() + """

                Always be concise, accurate, and helpful.
                """;
    }

    private AgentResponse parseResponse(String raw) {
        AgentResponse.AgentResponseBuilder builder = AgentResponse.builder();

        Matcher bookingMatcher = BOOKING_PATTERN.matcher(raw);
        if (bookingMatcher.find()) {
            builder.bookingReady(AgentResponse.BookingReady.builder()
                    .doctorId(Long.parseLong(bookingMatcher.group(1)))
                    .date(bookingMatcher.group(2))
                    .time(bookingMatcher.group(3))
                    .reason(bookingMatcher.group(4).trim())
                    .build());
            builder.message(raw.substring(0, bookingMatcher.start()).trim());
            return builder.build();
        }

        Matcher doctorsMatcher = DOCTORS_PATTERN.matcher(raw);
        if (doctorsMatcher.find()) {
            String json = doctorsMatcher.group(1);
            try {
                List<Map<String, Object>> rawList = objectMapper.readValue(
                        json, new TypeReference<>() {});
                List<AgentResponse.DoctorOption> doctors = rawList.stream()
                        .map(m -> AgentResponse.DoctorOption.builder()
                                .id(Long.parseLong(m.get("id").toString()))
                                .name(m.get("name").toString())
                                .build())
                        .toList();
                builder.doctorList(doctors);
            } catch (Exception e) {
                log.warn("Failed to parse [DOCTORS] tag: {}", e.getMessage());
            }
            builder.message(raw.substring(0, doctorsMatcher.start()).trim());
            return builder.build();
        }

        builder.message(raw);
        return builder.build();
    }

    public void clearSession(String sessionId) {
        conversationStore.clearSession(sessionId);
        log.info("Cleared session: {}", sessionId);
    }
}