# Project Optimization & Documentation Plan

This plan outlines the steps to resolve identified technical debt and architectural gaps across the `NeuralKnot` ecosystem, followed by the generation of a high-end `README.md`.

## User Review Required

> [!IMPORTANT]
> This plan involves cross-service changes (both `hospitalManagement` and `ai-service`) and infrastructure modifications in `docker-compose.yml`.

## Proposed Changes

---

### [Component] Intelligence Service (`ai-service`)

#### [MODIFY] [AgentService.java](file:///d:/Springboot/NeuralKnot/ai-service/src/main/java/com/rohan/ai_service/service/AgentService.java)
- **Problem**: Stale date in system prompt.
- **Fix**: Move prompt generation to a method and inject `LocalDate.now()` dynamically on each call.
- **Problem**: Fragile tag parsing.
- **Fix**: Update regex and prompt to handle whitespace and potential trailing characters more robustly.

#### [MODIFY] [HospitalTools.java](file:///d:/Springboot/NeuralKnot/ai-service/src/main/java/com/rohan/ai_service/tools/HospitalTools.java)
- **Problem**: Synchronous blocking calls without timeouts.
- **Fix**: Configure a `SimpleClientHttpRequestFactory` with `connectTimeout` and `readTimeout` (e.g., 5s) for the `RestTemplate`.

---

### [Component] Gateway Service (`hospitalManagement`)

#### [MODIFY] [AIProxyController.java](file:///d:/Springboot/NeuralKnot/hospitalManagement/src/main/java/com/example/springboot/hospitalManagement/controller/AIProxyController.java)
- **Problem**: No way for frontend to clear session through the proxy.
- **Fix**: Add `@DeleteMapping("/session/{sessionId}")` endpoint that forwards the request to the AI service.

---

### [Component] Infrastructure & Orchestration

#### [MODIFY] [docker-compose.yml](file:///d:/Springboot/NeuralKnot/docker-compose.yml)
- **Problem**: Race conditions during startup.
- **Fix**:
    - Add `healthcheck` to `hospital-app` (using `/actuator/health` or similar).
    - Update `ai-service` to use `condition: service_healthy` for `hospital-app`.

---

### [Component] Documentation

#### [NEW] [README.md](file:///d:/Springboot/NeuralKnot/README.md)
- **Content**: Detailed documentation of the API surface, internal communication flow, and setup guide.
- **Aesthetic**: Premium "Starboy" vibes (Nebula/Apex nomenclature, sleek styling).

## Verification Plan

### Automated Tests
- Run `mvn compile` on both services to ensure no breaking changes.
- Manually trigger `DELETE` on the new proxy endpoint and verify Redis key deletion.

### Manual Verification
- Start the entire stack with `docker-compose up`.
- Observe logs for correct startup sequence (AI service waiting for Hospital app).
- Test the "relative date" logic (e.g., "book for tomorrow") and verify it resolves correctly based on actual current date.
