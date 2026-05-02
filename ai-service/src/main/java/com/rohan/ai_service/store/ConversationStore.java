package com.rohan.ai_service.store;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ConversationStore {

    private static final int MAX_MESSAGE_HISTORY = 15;

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String PREFIX = "conversation:";
    private static final Duration TTL = Duration.ofHours(2);

    public List<Message> getHistory(String sessionId) {
        String key = PREFIX + sessionId;
        List<String> raw = redisTemplate.opsForList().range(key, -MAX_MESSAGE_HISTORY, -1);

        if (raw == null || raw.isEmpty()) return new ArrayList<>();

        List<Message> messages = new ArrayList<>();
        for (String entry : raw) {
            try {
                Map<String, String> map = objectMapper.readValue(entry, Map.class);
                String role = map.get("role");
                String content = map.get("content");
                if ("user".equals(role)) {
                    messages.add(new UserMessage(content));
                } else if ("assistant".equals(role)) {
                    messages.add(new AssistantMessage(content));
                }
            } catch (Exception e) {
                log.warn("Failed to deserialize message from Redis: {}", e.getMessage());
            }
        }
        return messages;
    }

    public void addMessage(String sessionId, String role, String content) {
        String key = PREFIX + sessionId;
        try {
            String entry = objectMapper.writeValueAsString(
                Map.of("role", role, "content", content)
            );
            redisTemplate.opsForList().rightPush(key, entry);
            redisTemplate.opsForList().trim(key, -MAX_MESSAGE_HISTORY, -1);
            redisTemplate.expire(key, TTL);
        } catch (Exception e) {
            log.error("Failed to store message in Redis for session {}: {}", sessionId, e.getMessage());
        }
    }

    public void clearSession(String sessionId) {
        redisTemplate.delete(PREFIX + sessionId);
        log.info("Cleared Redis session: {}", sessionId);
    }
}