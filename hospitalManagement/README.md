# 🏥 Hospital Management System

A production-grade backend REST API for managing hospital operations — built with **Spring Boot 4** and secured with **JWT authentication** and **Role-Based Access Control (RBAC)**.

---

## ✨ Features

### 🔐 Authentication & Authorization
- **JWT-based stateless authentication** — Login returns a signed JWT token (valid for 10 minutes) used for all subsequent requests via `Authorization: Bearer <token>` header.
- **Role-Based Access Control (RBAC)** — Three roles (`ADMIN`, `DOCTOR`, `PATIENT`) with endpoint-level access restrictions enforced through Spring Security's filter chain.
- **Signup with automatic Patient profile creation** — New users are registered with roles and a linked `Patient` entity is automatically created.
- **BCrypt password hashing** — All passwords are securely encoded before storage.
- **Centralized JWT exception delegation** — `JwtAuthFilter` delegates all token parsing errors to `GlobalExceptionHandler` via `HandlerExceptionResolver`, ensuring consistent error responses.

### 🏗️ Core Domain
- **Patient Management** — Profile retrieval by ID and paginated listing (admin only) using a native SQL query via Spring Data's `Page` support.
- **Doctor Management** — Public doctor listing, onboarding of new doctors (admin only) with automatic `DOCTOR` role assignment to the linked `User`.
- **Appointment System** — Create appointments between patients and doctors with reason and time; reassign appointments to a different doctor; view all appointments for a logged-in doctor.
- **Insurance Management** — Assign or remove insurance policies from patients with full cascade and orphan removal support.
- **Department Management** — Departments with a designated head doctor and a many-to-many association with multiple doctors.

### 🛡️ Error Handling
- **Global exception handler** via `@RestControllerAdvice` covering:
  - `AuthenticationException` → 401 Unauthorized
  - `AccessDeniedException` → 403 Forbidden
  - `JwtException` → 401 Unauthorized
  - `UsernameNotFoundException` → 404 Not Found
  - Generic `Exception` → 500 Internal Server Error
- Structured `ApiError` response with timestamp, error message, and HTTP status.

---

## 🏛️ Architecture

```
src/main/java/com/example/springboot/hospitalManagement/
├── Entity/                  # JPA Entities (User, Patient, Doctor, Appointment, Insurance, Department)
│   └── type/                # Enums (RoleType, BloodGroupType)
├── Repository/              # Spring Data JPA Repositories (6 interfaces)
├── service/                 # Service interfaces (AppointmentService, DoctorService, InsuranceService, PatientService)
│   └── impl/                # Service implementations
├── controller/              # REST Controllers (Auth, Admin, Doctor, Patient, Public)
├── dto/                     # Request/Response DTOs (10 classes)
├── security/                # JWT filter, AuthService, AuthUtil, WebSecurityConfig, CustomUserDetailsService
├── config/                  # App configuration (ModelMapper, PasswordEncoder via AppConfig)
└── error/                   # GlobalExceptionHandler + ApiError
```

---

## 🔧 Tech Stack

| Layer         | Technology                          |
|---------------|-------------------------------------|
| Language      | Java 21                             |
| Framework     | Spring Boot 4.0.3                   |
| Security      | Spring Security + JWT (jjwt 0.12.6) |
| Database      | PostgreSQL                          |
| ORM           | Spring Data JPA / Hibernate         |
| DTO Mapping   | ModelMapper 3.2.4                   |
| Boilerplate   | Lombok                              |
| Build Tool    | Maven                               |

---

## 📡 API Endpoints

### Public (No authentication required)
| Method | Endpoint              | Description           |
|--------|-----------------------|-----------------------|
| GET    | `/public/doctors`     | List all doctors      |
| POST   | `/auth/signup`        | Register a new user   |
| POST   | `/auth/login`         | Login and receive JWT |

### Authenticated (Any logged-in user)
| Method | Endpoint                 | Description                |
|--------|--------------------------|----------------------------|
| POST   | `/patients/appointments` | Create a new appointment   |
| GET    | `/patients/profile`      | Get patient profile        |

### Doctor / Admin Only
| Method | Endpoint                | Description                           |
|--------|-------------------------|---------------------------------------|
| GET    | `/doctors/appointments` | Get appointments for logged-in doctor |

### Admin Only
| Method | Endpoint                  | Description                             |
|--------|---------------------------|-----------------------------------------|
| GET    | `/admin/patients`         | List all patients (paginated)           |
| POST   | `/admin/onBoardNewDoctor` | Onboard an existing user as a doctor    |

> All endpoints are prefixed with `/api/v1` (configured via `server.servlet.context-path`).

---

## 📦 Entity Relationship Overview

```
User (1) ── (1) Patient ── (1) Insurance
  │                │
  │                └──── (M) Appointment (M) ──── (1) Doctor
  │                                                    │
  └──── (1) Doctor ──── (M) Department
```

- `User` implements `UserDetails` and holds a `Set<RoleType>` (`ADMIN`, `DOCTOR`, `PATIENT`) stored eagerly as strings.
- `Patient` and `Doctor` share the `User` primary key via `@MapsId` + `@OneToOne`.
- `Patient` has a composite unique constraint on `(name, birthDate)` and an index on `birthDate`.
- `Patient` ↔ `Insurance` — bidirectional `@OneToOne`; `Patient` is the owning side with `CascadeType.ALL` and orphan removal.
- `Patient` ↔ `Appointment` — `@OneToMany` with `CascadeType.REMOVE` and orphan removal.
- `Doctor` ↔ `Department` — `@ManyToMany`; `Department` is the owning side via a `department_doctors` join table.
- `Department` has a `@OneToOne` reference to a `headDoctor`.
- `Appointment` stores `appointmentTime` (`LocalDateTime`) and an optional `reason` (max 500 chars).
- `Insurance` stores `policyNumber` (unique), `provider`, and `validUntil` date with a `@CreationTimestamp` audit field.
- `BloodGroupType` enum: `A_POSITIVE`, `A_NEGATIVE`, `B_POSITIVE`, `B_NEGATIVE`, `AB_POSITIVE`, `AB_NEGATIVE`, `O_POSITIVE`, `O_NEGATIVE`.

---

## 🔑 Security Flow

```
Request
  └─► JwtAuthFilter (OncePerRequestFilter)
        ├── No/invalid Bearer token → pass through (public routes) or delegate exception
        ├── Valid token → extract username via AuthUtil (HMAC-SHA)
        │                 └── load User from DB, set SecurityContext
        └─► WebSecurityConfig (SecurityFilterChain)
              ├── /public/**, /auth/** → permitAll
              ├── /admin/**           → ROLE_ADMIN only
              ├── /doctors/**         → ROLE_DOCTOR or ROLE_ADMIN
              └── any other request   → authenticated
```

JWT tokens embed: `subject` (username), `userId` claim, `issuedAt`, and `expiration` (10 minutes). Signed with HMAC-SHA using the configured secret key.

---

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Maven 3.9+
- PostgreSQL (running on `localhost:5432`)

### 1. Clone the Repository
```bash
git clone https://github.com/rohansingh-code/hospitalManagementSystem.git
cd hospitalManagementSystem
```

### 2. Create the PostgreSQL Database
```sql
CREATE DATABASE hospitalDb;
```

### 3. Set Environment Variables
```bash
export DB_USERNAME=your_postgres_username
export DB_PASSWORD=your_postgres_password
```

You also need to set the JWT secret key. Add it to your `application.properties` or pass as an environment variable:
```properties
jwt.secretKey=your-256-bit-secret-key-here
```

### 4. Build & Run
```bash
mvn clean install
mvn spring-boot:run
```

The API will be available at `http://localhost:8080/api/v1`.

---

## 📝 Sample Requests

### Sign Up
```bash
curl -X POST http://localhost:8080/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "securePass123",
    "name": "John Doe",
    "roles": ["PATIENT"]
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john@example.com",
    "password": "securePass123"
  }'
```

### Access Protected Endpoint
```bash
curl http://localhost:8080/api/v1/patients/profile \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create an Appointment
```bash
curl -X POST http://localhost:8080/api/v1/patients/appointments \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": 1,
    "doctorId": 2,
    "appointmentTime": "2026-05-01T10:30:00",
    "reason": "Annual checkup"
  }'
```

### Onboard a New Doctor (Admin only)
```bash
curl -X POST http://localhost:8080/api/v1/admin/onBoardNewDoctor \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 5,
    "name": "Dr. Kapoor",
    "specialization": "Dermatology"
  }'
```

---

## ⚠️ Notes
- `spring.jpa.hibernate.ddl-auto` is set to `create` — tables are dropped and recreated on every startup. Change to `update` or `validate` for production.
- SQL data seeding via `data.sql` is present but currently **disabled** (re-enable by uncommenting the `spring.sql.init.*` properties in `application.properties`).
- `spring.jpa.show-sql=true` is enabled by default — disable in production to reduce log verbosity.
- The `/patients/profile` endpoint currently uses a hardcoded patient ID (`1L`) — this should be replaced with the authenticated user's ID from the `SecurityContext` in a future iteration.
