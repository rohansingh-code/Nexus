package com.rohan.ai_service.service;

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

@Slf4j
@Service
public class AgentService {

    private final ChatClient chatClient;
    private final ConversationStore conversationStore;
    private final ObjectMapper objectMapper;

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

            CRITICAL: You MUST respond with ONLY valid JSON. No text before or after.
            No markdown, no backticks, no explanation outside the JSON object.

            Always respond with this exact JSON structure:
            {
              "message": "<your natural language response to the user>",
              "doctorList": null,
              "bookingReady": null
            }

            SPECIALIZATION MAPPING — You MUST use ONLY these exact values when calling tools.
            Never invent or paraphrase. Pick the closest match from this list:

            | Symptoms                                                        | Use this EXACT value |
            |-----------------------------------------------------------------|----------------------|
            | General illness, fever, cold, flu, fatigue, checkup, body ache | General Medicine     |
            | Heart, chest pain, blood pressure, palpitations, cholesterol    | Cardiologist         |
            | Skin, rash, acne, hair loss, nails, allergies, eczema           | Dermatologist        |
            | Brain, headache, seizures, nerves, dizziness, stroke, memory    | Neurologist          |
            | Bones, joints, fractures, back pain, sports injury, arthritis   | Orthopedic           |
            | Women's health, pregnancy, menstrual issues, PCOS               | Gynecologist         |
            | Children under 18, pediatric issues, growth, vaccination        | Pediatrician         |

            If symptoms don't clearly match any category, use: General Medicine
            If a user asks for a specialization not in this list, tell them that
            specialization is not currently available and suggest the closest match.

            Follow this exact conversation flow:

            Step 1 — When user describes symptoms:
              - Identify the specialization using ONLY the table above
              - Remember the symptoms exactly — this becomes the appointment reason
              - Do NOT call any tool yet
              - Set "message" to ask for date and time
              - Set "doctorList" to null, "bookingReady" to null

            Step 2 — When user provides date and time:
              - Parse it into ISO format: YYYY-MM-DDThh:mm:ss
              - For relative dates like "tomorrow", resolve against today's date
              - If the date is in the past: set "message" to ask for a future date,
                set "doctorList" to null, "bookingReady" to null
              - If date is valid: call getAvailableDoctors(specialization, dateTime)
                using the EXACT specialization value from the table above
              - If tool returns empty list: set "message" to say no doctors are
                available at that time and ask for a different slot,
                set "doctorList" to null, "bookingReady" to null
              - If doctors found: set "message" to introduce the doctors,
                set "doctorList" to the array like:
                [{"id": 1, "name": "Dr. Sharma"}]

            Step 3 — When user picks a doctor:
              - Confirm the booking details in "message"
              - Set "bookingReady" to:
                {"doctorId": <id>, "doctorName": "<name>", "date": "<YYYY-MM-DD>", "time": "<HH:MM>", "reason": "<original symptoms>"}
              - Set "doctorList" to null

            If symptoms are an emergency: set "message" to advise calling emergency
            services immediately, set "doctorList" to null, "bookingReady" to null.

            Today's date is:\s""" + LocalDate.now() + """

            Remember: ONLY return valid JSON. Nothing else.
            """;
}

    private AgentResponse parseResponse(String raw) {
        // strip markdown code fences if LLM adds them anyway
        String cleaned = raw.strip();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned
                .replaceAll("^```(?:json)?\\s*", "")
                .replaceAll("```\\s*$", "")
                .strip();
        }

        try {
            AgentResponse response = objectMapper.readValue(cleaned, AgentResponse.class);
            // safety — ensure message is never null
            if (response.getMessage() == null) {
                response.setMessage("I'm here to help. Could you describe your symptoms?");
            }
            return response;
        } catch (Exception e) {
            log.warn("Failed to parse JSON response, falling back. Raw: {}", cleaned);
            log.warn("Parse error: {}", e.getMessage());
            // fallback — treat entire response as plain message
            return AgentResponse.builder()
                    .message(cleaned)
                    .build();
        }
    }

    public void clearSession(String sessionId) {
        conversationStore.clearSession(sessionId);
        log.info("Cleared session: {}", sessionId);
    }
}