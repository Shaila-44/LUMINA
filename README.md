<div align="center">

# PM-AJAY Digital Coordination Platform

**Pradhan Mantri Adi Janjati Adivasi Yojana**

A full-stack government project management system for tracking tribal welfare projects, fund flows, and compliance across Centre → State → Agency hierarchies.

</div>

---

## What It Does

PM-AJAY is a role-based digital platform that connects three tiers of government:

| Role | Who | What they do |
|------|-----|-------------|
| **Centre** | Ministry of Social Justice & Empowerment | Creates projects, releases funds to States, monitors progress nationwide, manages users & audit logs |
| **State / UT** | State Government Officers | Registers agencies, assigns projects, disburses funds, approves DPRs, submits reports to Centre |
| **Agency** | Ground-level Executing Agencies | Executes work, updates task progress, uploads bills & documents, submits DPRs |

**Key features:**
- JWT-secured role-based authentication (3 roles)
- Real-time dashboard with project status charts and fund flow analytics
- Fund transaction tracking — Centre → State → Agency disbursement chain
- Document upload & verification workflow
- DPR (Detailed Project Report) submission & approval pipeline
- Notification system with 30-second polling
- Full audit log of all system actions
- Utilization Certificate & Quarterly Progress Reports

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Recharts, React Router v6, TailwindCSS |
| Backend | Spring Boot 3.2 (Java 17), Spring Security, Spring Data JPA |
| Database | MySQL 8+ |
| Auth | JWT (JJWT 0.12) |
| Build | Maven (backend), npm (frontend) |

---

## Prerequisites

Make sure these are installed before you start:

- **Java 17+** — `java -version`
- **Maven 3.8+** — `mvn -version`
- **Node.js 18+** — `node -version`
- **MySQL 8+** — running locally on port `3306`

---

## Setup Steps

### 1. Clone the repository

```bash
git clone https://github.com/Arunkumar19-20/LUMINA.git
cd LUMINA
```

---

### 2. Set up the database

```sql
-- Open MySQL and run:
CREATE DATABASE ajay;
```

---

### 3. Configure backend secrets

```bash
cd backend/src/main/resources

# Copy the example template
cp application-local.properties.example application-local.properties
```

Open `application-local.properties` and fill in your values:

```properties
DB_PASSWORD=your_mysql_password
JWT_SECRET=<output of: openssl rand -base64 32>
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-gmail-app-password
DEMO_MODE_ENABLED=true
SPRING_PROFILES_ACTIVE=dev
```

> **Tip:** Generate a secure JWT secret with `openssl rand -base64 32`

---

### 4. Start the backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8081**

> On first run, `DataSeeder` automatically creates sample states, users, agencies, projects, and fund transactions so the dashboard has real data to display.

---

### 5. Install frontend dependencies

```bash
cd frontend
npm install
```

---

### 6. Start the frontend

```bash
npm run dev
```

The frontend starts on **http://localhost:5173**

---

### 7. Log in

Open http://localhost:5173 and click one of the **role cards** on the login page (Centre Admin / State Officer / Agency Officer). The demo login calls the backend directly — no passwords needed in the UI.

---

## Environment Variables Reference

All backend secrets are read from environment variables (never hard-coded).

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_URL` | `jdbc:mysql://localhost:3306/ajay` | MySQL connection URL |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | *(required)* | MySQL password |
| `JWT_SECRET` | *(required)* | HS256 signing key — min 32 chars |
| `JWT_EXPIRATION` | `86400000` | Token TTL in milliseconds (24 h) |
| `MAIL_USERNAME` | *(required)* | SMTP sender email |
| `MAIL_PASSWORD` | *(required)* | SMTP app password |
| `DEMO_MODE_ENABLED` | `false` | Enables `/api/auth/demo` endpoint |
| `SPRING_PROFILES_ACTIVE` | `dev` | `dev` (auto schema) or `prod` (validate only) |
| `SERVER_PORT` | `8081` | Backend HTTP port |

---

## Project Structure

```
LUMINA/
├── backend/                        # Spring Boot API
│   ├── src/main/java/com/pmajay/
│   │   ├── controller/             # REST endpoints
│   │   ├── service/                # Business logic
│   │   ├── model/                  # JPA entities
│   │   ├── repository/             # Spring Data repos
│   │   ├── dto/                    # Request/response DTOs
│   │   ├── security/               # JWT filter, JwtUtil, SecurityConfig
│   │   ├── config/                 # DataSeeder, AppConfig
│   │   ├── aspect/                 # AOP audit logging
│   │   └── scheduler/              # Scheduled tasks
│   └── src/main/resources/
│       ├── application.properties              # Base config (no secrets)
│       ├── application-dev.properties          # Dev overrides
│       ├── application-prod.properties         # Prod overrides
│       └── application-local.properties.example  # Secret template
│
└── frontend/                       # React + Vite SPA
    └── src/
        ├── pages/
        │   ├── centre/             # Centre role pages
        │   ├── state/              # State role pages
        │   ├── agency/             # Agency role pages
        │   └── shared/            # 404, Unauthorized, Notifications
        ├── components/             # Layout, NotificationBell
        ├── context/                # AuthContext
        └── services/               # api.js (Axios instance + interceptors)
```

---

## API Reference

> **Base URL:** `http://localhost:8081/api`
>
> All endpoints except `/auth/**` and `/states` require a JWT in the `Authorization: Bearer <token>` header.

---

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/login` | Public | Login with email + password. Returns JWT + user info |
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/demo` | Public* | Demo login by role (`CENTRE`, `STATE`, `AGENCY`). Requires `DEMO_MODE_ENABLED=true` |

**Login request:**
```json
{ "email": "officer@pmajay.gov.in", "password": "yourpassword" }
```

**Demo login request:**
```json
{ "role": "CENTRE" }
```

**Response (both):**
```json
{
  "token": "<JWT>",
  "name": "Admin Centre",
  "email": "admin@pmajay.gov.in",
  "role": "CENTRE",
  "userId": 1,
  "stateId": null,
  "agencyId": null
}
```

---

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard/summary` | Overall counts — total projects, agencies, funds released, delayed projects, breakdown by component |
| `GET` | `/dashboard/fund-flow` | Fund released vs utilized per state (used for bar chart) |
| `GET` | `/dashboard/project-stats` | Alias for summary — project stats |

---

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List all projects |
| `GET` | `/projects/{id}` | Get project by ID |
| `POST` | `/projects` | Create a new project |
| `PUT` | `/projects/{id}` | Update project details |
| `GET` | `/projects/status/{status}` | Filter by status: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `DELAYED` |
| `GET` | `/projects/delayed` | List all delayed projects (past deadline) |
| `PUT` | `/projects/{id}/progress` | Update completion percentage `{ "progress": 75 }` |
| `GET` | `/projects/state/{stateId}` | Projects assigned to a specific state |
| `GET` | `/projects/agency/{agencyId}` | Projects assigned to a specific agency |

---

### Agencies

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/agencies` | List all agencies |
| `GET` | `/agencies/{id}` | Get agency by ID |
| `POST` | `/agencies` | Register a new agency |
| `PUT` | `/agencies/{id}` | Update agency details |
| `DELETE` | `/agencies/{id}` | Delete an agency |
| `GET` | `/agencies/state/{stateId}` | Agencies belonging to a state |
| `GET` | `/agencies/component/{component}` | Filter by component: `ADARSH_GRAM`, `HOSTEL`, `GIA` |

---

### Funds

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/funds` | List all fund transactions |
| `GET` | `/funds/project/{projectId}` | Fund transactions for a project |
| `POST` | `/funds` | Create a fund release transaction |
| `PUT` | `/funds/{id}` | Update a fund transaction |
| `GET` | `/funds/summary` | Aggregated fund summary per state |

---

### Approvals (DPRs & Work Plans)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/approvals` | List all approvals |
| `GET` | `/approvals/status/{status}` | Filter by: `PENDING`, `APPROVED`, `REJECTED` |
| `GET` | `/approvals/state/{stateId}` | Approvals for a specific state |
| `GET` | `/approvals/user/{userId}` | Approvals submitted by a user |
| `POST` | `/approvals` | Submit a new DPR or work plan |
| `PUT` | `/approvals/{id}/approve` | Approve `{ "reviewerId": 1 }` |
| `PUT` | `/approvals/{id}/reject` | Reject `{ "reviewerId": 1 }` |

---

### Documents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/documents` | List all documents |
| `GET` | `/documents/agency/{agencyId}` | Documents uploaded by an agency |
| `GET` | `/documents/project/{projectId}` | Documents linked to a project |
| `GET` | `/documents/type/{type}` | Filter by type: `PHOTO`, `BILL`, `INSPECTION`, `UC` |
| `POST` | `/documents` | Upload / register a document |
| `PUT` | `/documents/{id}/verify` | Mark document as verified |

---

### Expenses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/expenses` | List all expenses |
| `GET` | `/expenses/agency/{agencyId}` | Expenses by agency |
| `GET` | `/expenses/project/{projectId}` | Expenses for a project |
| `POST` | `/expenses` | Record a new expense |
| `GET` | `/expenses/total/project/{projectId}` | Total spend for a project |
| `GET` | `/expenses/total/agency/{agencyId}` | Total spend by an agency |

---

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/reports` | List all reports |
| `GET` | `/reports/state/{stateId}` | Reports submitted by a state |
| `GET` | `/reports/type/{type}` | Filter by type: `UC` (Utilization Certificate), `QPR`, `APR` |
| `POST` | `/reports` | Submit a new report |
| `PUT` | `/reports/{id}/verify` | Mark report as verified |

---

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/notifications/user/{userId}` | Get all notifications for a user |
| `PUT` | `/notifications/{id}/read` | Mark a notification as read |

---

### Audit Log

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/audit` | CENTRE only | All system audit entries (newest first) |
| `GET` | `/audit/user/{userId}` | CENTRE only | Audit entries for a specific user |

---

### States

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/states` | Public | List all 14 seeded states |

---

## Demo Data

The backend auto-seeds on first run. You get:

- **14 States** — AP, Bihar, Gujarat, Maharashtra, UP, etc.
- **3 Users** — one per role (Centre Admin, AP State Officer, Agency Officer AP)
- **5 Agencies** — AP Tribal Welfare, Bihar SC/ST Corp, Gujarat Hostel Board, etc.
- **6 Projects** — spanning all 3 components, mixed statuses
- **6 Fund transactions** — Centre and State releases
- **3 Approvals** — DPRs and work plans in various states
- **3 Documents** — photos, bills, inspection reports
- **3 Expenses** — material and labour costs
- **3 Reports** — UC, QPR, APR

---

## Common Issues

| Problem | Fix |
|---------|-----|
| Backend fails to start — `DB_PASSWORD not set` | Fill in `application-local.properties` |
| `Access Denied` on API calls | Token is expired or missing — log in again |
| Frontend can't reach backend | Ensure backend is running on port 8081 and Vite proxy is active |
| Demo login returns 404 | Set `DEMO_MODE_ENABLED=true` in your local properties |
| MySQL `Table doesn't exist` | Ensure `SPRING_PROFILES_ACTIVE=dev` so Hibernate creates tables on first run |
