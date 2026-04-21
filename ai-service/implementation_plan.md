# Goal: Restoring AI Tool Integration
The goal of this plan is to bridge the authorization and payload gaps between the core backend and the `ai-service` so that the AI Agent can successfully parse user inputs and securely book medical appointments.

## Proposed Changes

### Hospital Management (Backend)

#### [MODIFY] [CreateAppointmentRequestDto.java](file:///d:/Springboot/NeuralKnot/hospitalManagement/src/main/java/com/example/springboot/hospitalManagement/dto/CreateAppointmentRequestDto.java)
- Remove `patientId` (and its validation annotations) entirely. The `PatientController` already handles extraction securely from the JWT token, so demanding it in the JSON payload throws unnecessary 400 Bad Requests and forces the AI agent to somehow "guess" who is logged in.

#### [MODIFY] [AIProxyController.java](file:///d:/Springboot/NeuralKnot/hospitalManagement/src/main/java/com/example/springboot/hospitalManagement/controller/AIProxyController.java)
- Inject the `@RequestHeader("Authorization")` piece into the `/ai/query` endpoint.
- Swap out `restTemplate.postForObject` in favor of using an `HttpEntity` that actively forwards the `Authorization` token directly downstream to the `ai-service`.

---

### AI Service (Java Microservice)

#### [NEW] [AuthContext.java](file:///d:/Springboot/NeuralKnot/ai-service/src/main/java/com/rohan/ai_service/util/AuthContext.java)
- Create a simple, thread-safe `ThreadLocal` wrapper located at `com.rohan.ai_service.util.AuthContext` inside `ai-service`.
- This ensures we can pass dynamic HTTP session headers securely to Spring AI Tools operating deeper within the transaction.

#### [MODIFY] [AgentController.java](file:///d:/Springboot/NeuralKnot/ai-service/src/main/java/com/rohan/ai_service/controller/AgentController.java)
- Extract the forwarded `Authorization` header at the edge `/ai/query` endpoint.
- Store the captured token in the `AuthContext` wrapper and safely clear it in a `finally` block to prevent lingering thread pollution.

#### [MODIFY] [HospitalTools.java](file:///d:/Springboot/NeuralKnot/ai-service/src/main/java/com/rohan/ai_service/tools/HospitalTools.java)
- Load the dynamic patient token from `AuthContext` and embed it cleanly inside `HttpHeaders`.
- Execute the backend REST call properly attached with these headers to easily bypass `401 Unauthorized` restrictions.
- Expand parameters: modify `bookAppointment(Long doctorId, String date)` to support `String time` and `String reason`.
- Format `appointmentTime` rigidly as `YYYY-MM-DDTHH:MM:00` so it identically maps to Java's `LocalDateTime` specification, and construct the correct JSON map body.

## Verification Plan
1. Ensure both the Java backend and AI-Service build cleanly.
2. Confirm that the JWT Token propagates successfully automatically through all machine-to-machine loopback HTTP logic routines without 401/403 failure.
3. Validate that standard LLM Tooling executes reliably and persists appointment payloads symmetrically within H2 DB bounds.

