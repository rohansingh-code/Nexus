# Nexus · Agentic Medical Intelligence

> An autonomous AI agent that reasons over symptoms, orchestrates tool calls, and drives end-to-end appointment booking — without human intervention at each step.

Nexus is a **production-grade agentic AI system** built on a polyglot microservices stack. It is not a chatbot with a backend. It is a goal-directed reasoning agent that perceives patient intent, plans a resolution path, autonomously invokes tools against live hospital APIs, manages multi-turn session state, and emits structured action signals to orchestrate client-side execution — all within a single conversational loop.

---

## What Makes It Agentic

Most "AI-powered" apps are prompt-in, response-out. Nexus is different:

| Property | Implementation |
| :--- | :--- |
| **Goal-directed reasoning** | Agent infers medical specialization and booking intent from natural language — no structured form input |
| **Autonomous tool invocation** | Agent decides *when* and *how* to call `getAvailableDoctors` based on its own reasoning state |
| **Multi-turn memory** | Full conversation history persisted in Redis; agent maintains context across an entire triage session |
| **Structured action emission** | Agent produces machine-readable tags (`[DOCTORS]`, `[BOOKING_READY]`) as signals to trigger downstream UI and API actions |
| **Stateful session lifecycle** | Each session is an isolated reasoning context — created, evolved, and explicitly terminated |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT / FRONTEND                        │
│         Intercepts [DOCTORS] and [BOOKING_READY] action tags     │
└──────────────────────────┬──────────────────────────────────────┘
                           │ JWT-authenticated requests
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GATEWAY SERVICE  (hospital-app :8080)           │
│   Auth · RBAC · Patient Records · Appointment API · AI Proxy    │
└───────────────┬─────────────────────────────┬───────────────────┘
                │ Proxied AI requests          │ Direct DB queries
                ▼                              ▼
┌──────────────────────────────┐   ┌──────────────────────────────┐
│  INTELLIGENCE SERVICE        │   │         PostgreSQL            │
│  (hospital-ai :8081)         │   │  Users · Doctors · Appts     │
│                              │   └──────────────────────────────┘
│  ┌────────────────────────┐  │   ┌──────────────────────────────┐
│  │   Reasoning Loop       │  │   │           Redis              │
│  │  (Spring AI + Groq)    │  │   │  Conversation History        │
│  └──────────┬─────────────┘  │   │  Triage Session State        │
│             │ Tool calls      │   └──────────────────────────────┘
│  ┌──────────▼─────────────┐  │
│  │   Tool Registry        │  │
│  │  getAvailableDoctors   │──┼──► /api/v1/public/doctors/available
│  └────────────────────────┘  │
└──────────────────────────────┘
```

---

## The Agent Reasoning Loop

Nexus's intelligence service runs a **Perceive → Plan → Act → Respond** cycle on every turn:

```
User Input
    │
    ▼
┌─────────────────────────────────────────────────┐
│  PERCEIVE  — Load session history from Redis     │
│             Reconstruct full conversation context│
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────┐
│  PLAN      — Groq LLM reasoning step            │
│             Identify specialization + intent     │
│             Decide: need tool call? ready?       │
└──────────────────────┬──────────────────────────┘
                       │
          ┌────────────┴─────────────┐
          │ Tool required            │ No tool needed
          ▼                          ▼
┌──────────────────┐      ┌──────────────────────────┐
│  ACT             │      │  RESPOND                 │
│  Invoke tool:    │      │  Emit natural language   │
│  getAvailable    │      │  + action tag if ready:  │
│  Doctors(...)    │      │  [DOCTORS: {...}]         │
│                  │      │  [BOOKING_READY: {...}]   │
│  Receive slots   │      └──────────────────────────┘
│  Inject into     │
│  reasoning ctx   │
└────────┬─────────┘
         │
         └──────────► Loop back to PLAN
```

### Agent Action Tags

The agent communicates structured intent through embedded tags in its response text. The client treats these as executable signals:

```
[DOCTORS: {"doctors": [...], "specialization": "Cardiologist", "requested_time": "afternoon"}]
```
→ Client renders a doctor selection card UI.

```
[BOOKING_READY: {"doctor_id": 42, "patient_id": 7, "shift": "AFTERNOON", "date": "2025-12-01"}]
```
→ Client fires `POST /api/v1/patients/appointments` with the payload. No human-constructed form. No extra round trip.

---

## Microservices Breakdown

### `hospital-app` — Gateway Service
Spring Boot application responsible for all patient-facing operations. Acts as the secure perimeter: validates JWTs, enforces RBAC, owns the patient and appointment domain, and proxies AI requests to the intelligence service with credentials attached.

### `ai-service` — Intelligence Service
Spring AI microservice hosting the agent loop. Manages tool registration, Groq API communication, Redis-backed session state, and structured output emission. Stateless at the container level — all session context lives in Redis.

---

## API Reference

### Authentication
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/signup` | `POST` | Public | Register a new patient |
| `/api/v1/auth/login` | `POST` | Public | Authenticate, receive JWT |

### Agent Interface
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/ai/query` | `POST` | JWT | Primary agent chat endpoint |
| `/ai/session/{id}` | `DELETE` | Internal | Terminate and clear a session |

### Patient Operations
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/patients/appointments` | `POST` | JWT | Execute a `[BOOKING_READY]` intent |
| `/api/v1/patients/profile` | `GET` | JWT | Retrieve authenticated patient profile |

### Public Discovery _(used internally by agent tools)_
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/public/doctors` | `GET` | Public | List doctors by specialization |
| `/api/v1/public/doctors/available` | `GET` | Public | Real-time slot availability by shift |

---

## Environment Configuration

```bash
# ── Intelligence Service ─────────────────────────────
GROQ_API_KEY=your_groq_api_key
HOSPITAL_SERVICE_URL=http://hospital-app:8080
REDIS_HOST=redis

# ── Gateway Service ──────────────────────────────────
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/hospital_db
JWT_SECRET=your_secret_min_256_bits          # Never commit this
AI_SERVICE_URL=http://hospital-ai:8081
```

---

## Running the Stack

```bash
docker-compose up --build
```

Initialization order is dependency-resolved:

```
PostgreSQL → Redis → hospital-app → ai-service
```

Health checks available at `/actuator/health` on both Spring Boot services.

---

## Project Structure

```
nexus/
├── hospital-app/        # Gateway: auth, RBAC, patients, appointments
│   └── src/
├── ai-service/          # Agent: reasoning loop, tool registry, session state
│   └── src/
├── docker-compose.yml
└── .env
```

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Agent Runtime | Spring AI + Groq (LLaMA 3) |
| Gateway | Spring Boot 4, Spring Security, JWT |
| Persistence | PostgreSQL (JPA/Hibernate) |
| Session State | Redis |
| Containerization | Docker Compose |
| Tool Protocol | Spring AI Function Calling |

---
