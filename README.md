# Nexus · Agentic Medical Intelligence

> An autonomous AI agent that reasons over symptoms, orchestrates tool calls, and drives end-to-end appointment booking — without human intervention at each step.

Nexus is a **production-grade agentic AI system** built on a polyglot microservices stack. It is not just a chatbot with a backend; it is a goal-directed reasoning agent that perceives patient intent, plans a resolution path, autonomously invokes tools against live hospital APIs, manages multi-turn session state, and emits structured action signals to orchestrate client-side execution — all within a single conversational loop.

---

## 🚀 Core Architecture

The system is architected as a decoupled microservices environment orchestrated via Docker:

- **Gateway Service (`hospitalManagement`)**: The primary API gateway handling authentication (JWT), RBAC, patient records, and secure proxying.
- **Intelligence Service (`ai-service`)**: A specialized Spring AI microservice that executes reasoning loops, tool-calling (via Groq), and session-based state management.
- **State Layer**: 
    - **PostgreSQL**: Hard persistence for users, doctors, and appointments.
    - **Redis**: High-speed ephemeral storage for AI conversation history and triage states.

---

## 🔄 The Agent Reasoning Loop

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

- `[DOCTORS: {...}]`: Client renders a doctor selection card UI.
- `[BOOKING_READY: {...}]`: Client fires `POST /api/v1/patients/appointments` with the automatically constructed payload.

---

## 🛠️ API Reference

### 1. Authentication (`hospital-app`)
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/signup` | `POST` | Public | Register a new patient |
| `/api/v1/auth/login` | `POST` | Public | Authenticate and receive a JWT |

### 2. AI Interface (`hospital-app` -> `ai-service`)
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/ai/query` | `POST` | JWT | Primary agent chat endpoint |
| `/ai/session/{id}` | `DELETE` | Internal | Terminate and clear a session state |

### 3. Patient Operations (`hospital-app`)
| Endpoint | Method | Auth | Description |
| :--- | :--- | :--- | :--- |
| `/api/v1/patients/appointments` | `POST` | JWT | Execute a `[BOOKING_READY]` intent |
| `/api/v1/patients/profile` | `GET` | JWT | Retrieve authenticated patient profile |

---

## 📁 Project Structure

```
nexus/
├── hospitalManagement/  # Gateway: auth, RBAC, patients, appointments
├── ai-service/          # Agent: reasoning loop, tool registry, session state
├── client/              # Frontend: React.js user interface
├── docker-compose.yml
└── .env.example
```

---

## ⚙️ Environment Configuration

Ensure the following variables are defined in your `.env` file at the root:

```bash
# -- Shared / Database --
POSTGRES_DB=hospital_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
DB_URL=jdbc:postgresql://postgres:5432/hospital_db
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password

# -- Intelligence Service (ai-service) --
GROQ_API_KEY=your_groq_api_key
HOSPITAL_SERVICE_URL=http://hospital-app:8080
REDIS_HOST=redis
REDIS_PORT=6379

# -- Gateway Service (hospitalManagement) --
JWT_SECRETKEY=your_secret_key
AI_SERVICE_URL=http://hospital-ai:8081
```

---

## 🏗️ Running the Stack

Spin up the entire intelligence stack with a single command:

```bash
docker-compose up --build
```

Nodes will initialize in sequence: **Postgres -> Redis -> Hospital App -> AI Service**. Health checks are available at `/actuator/health` on both Spring Boot services.

---

## 📁 Project Structure

```
nexus/
├── hospitalManagement/  # Gateway: auth, RBAC, patients, appointments
├── ai-service/          # Agent: reasoning loop, tool registry, session state
├── docker-compose.yml
└── .env
```

---

## 💻 Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React.js (Vite) |
| Agent Runtime | Spring AI + Groq (LLaMA 3) |
| Gateway | Spring Boot, Spring Security, JWT |
| Persistence | PostgreSQL (JPA/Hibernate) |
| Session State | Redis |
| Containerization | Docker Compose |
