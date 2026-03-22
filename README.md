# 🗓️ Full-Stack Booking System

> A production-ready, concurrent-safe booking platform built with modern full-stack technologies.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11-red?style=for-the-badge&logo=nestjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green?style=for-the-badge&logo=postgresql)
![Tests](https://img.shields.io/badge/Tests-21%2F21%20Passed-brightgreen?style=for-the-badge)

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, TailwindCSS |
| Backend | NestJS, TypeScript |
| Database | PostgreSQL via Drizzle ORM (Neon) |
| Validation | Zod (shared schemas) |
| Auth | JWT via HttpOnly Cookies |
| Testing | Jest, Supertest (Unit + E2E) |

---

## 🏗️ Project Structure
```
booking-system/
├── apps/
│   ├── web/                  # Next.js frontend (App Router)
│   │   ├── app/              # Pages
│   │   ├── components/       # UI components
│   │   └── lib/              # API client, auth helpers
│   └── api/                  # NestJS backend
│       ├── src/
│       │   ├── auth/         # JWT auth module
│       │   ├── bookings/     # Booking module
│       │   ├── db/           # Drizzle ORM config
│       │   ├── common/       # Error codes enum
│       │   └── filters/      # Zod exception filter
│       └── test/             # E2E tests
└── packages/
    └── schemas/              # Shared Zod schemas
```

---

## 🧠 Architecture Decisions

### 🗄️ Why no sessions table?
Time slots are deterministic (09:00–17:00). Storing them in the database would be unnecessary complexity. This keeps the schema lean and queries fast.

### ⚡ Why DB constraint for concurrency?
```sql
UNIQUE(date, timeSlot)
```
We rely on database-level constraints instead of application-level locking. When two users book the same slot simultaneously, PostgreSQL rejects the second insert with error code `23505`, which we catch and map to a clean `409 Conflict` response.

> **Proof:** `Concurrent Test Statuses: [ 201, 409 ]`

### 🔗 Why shared Zod schemas?
```typescript
// packages/schemas — used by BOTH frontend and backend
export type BookingCreateInput = z.infer
```
A single source of truth for validation. No drift between frontend and backend types.

### 🍪 Why HttpOnly cookies?
JWT tokens stored in `localStorage` are vulnerable to XSS. HttpOnly cookies are inaccessible to JavaScript, providing a much stronger security boundary.

---

## ⚖️ Trade-offs

| Decision | Reason |
|----------|--------|
| No refresh tokens | Simplified for demo scope |
| Email mocked | SendGrid can replace in production |
| Fixed 60min slots | Dynamic scheduling is a future improvement |
| No WebSocket | Page refreshes after booking (sufficient for demo) |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v20+
- pnpm v10+
- PostgreSQL (Neon recommended — free tier available)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/booking-system.git
cd booking-system
```

### 2. Install dependencies
```bash
pnpm install
```

### 3. Configure environment variables

**Backend** → create `apps/api/.env`:
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your-super-secret-key
PORT=3001
```

**Frontend** → create `apps/web/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Database setup
```bash
cd apps/api
pnpm db:generate   # Generate migration files
pnpm db:migrate    # Apply migrations to database
```

### 5. Start the application

**Terminal 1 — Backend:**
```bash
cd apps/api
pnpm start:dev
# API running at http://localhost:3001
```

**Terminal 2 — Frontend:**
```bash
cd apps/web
pnpm dev
# App running at http://localhost:3000
```

---

## 📡 API Documentation

### 🔐 Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login + set cookie | ❌ |
| POST | `/auth/logout` | Clear auth cookie | ❌ |
| GET | `/auth/me` | Get current user | ✅ |

#### POST /auth/register
```json
// Request
{ "name": "John Doe", "email": "john@example.com", "password": "123456" }

// Response 201
{ "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com" } }
```

#### POST /auth/login
```json
// Request
{ "email": "john@example.com", "password": "123456" }

// Response 200
{ "user": { "id": "uuid", "name": "John Doe", "email": "john@example.com" } }
// + Sets HttpOnly cookie: token=
```

### 📅 Booking Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/bookings/available?date=` | Get available slots | ❌ |
| POST | `/bookings` | Create booking | ✅ |
| GET | `/bookings/me` | My bookings | ✅ |

#### GET /bookings/available?date=2026-03-25
```json
// Response 200
{
  "date": "2026-03-25",
  "slots": [
    { "timeSlot": "09:00", "duration": 60, "available": true },
    { "timeSlot": "10:00", "duration": 60, "available": true }
  ]
}
```

#### POST /bookings
```json
// Request
{ "date": "2026-03-25", "timeSlot": "10:00" }

// Response 201
{ "id": "uuid", "date": "2026-03-25", "timeSlot": "10:00", "duration": 60, "message": "..." }

// Error responses
{ "error": "SLOT_ALREADY_BOOKED", "message": "Bu saat dilimi zaten dolu" }  // 409
{ "error": "PAST_TIME", "message": "Gecmis saat icin randevu alinamaz" }     // 400
{ "error": "PAST_DATE", "message": "Gecmis tarih icin randevu alinamaz" }    // 400
```

---

## 🧪 Running Tests
```bash
cd apps/api

# Unit tests (service layer)
pnpm test

# E2E tests (full HTTP flow)
pnpm test:e2e

# Coverage report
pnpm test:cov
```

---

## ✅ Test Results
```
Unit Tests:  13/13 ✅ PASSED
E2E Tests:    8/8  ✅ PASSED
─────────────────────────────
Total:       21/21 ✅ ALL PASSED
```

### 🔥 Concurrent Booking Test Evidence
```
Concurrent Test Statuses: [ 201, 409 ]
```
Two simultaneous POST requests to the same slot:
- **Request 1** → `201 Created` ✅
- **Request 2** → `409 Conflict` ✅

Database-level `UNIQUE(date, timeSlot)` constraint handled the race condition perfectly — no application-level locks needed.

---

## 🗃️ Database Setup Guide

This project uses [Neon](https://neon.tech) — a serverless PostgreSQL provider.

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project → select **Europe (Frankfurt)** region
3. Copy the connection string from the dashboard
4. Paste it into `apps/api/.env` as `DATABASE_URL`
5. Run: `pnpm db:migrate`

> **Note:** All dates are stored and compared in UTC to avoid timezone inconsistencies across different client locales.

---

## 🔮 Future Improvements

- [ ] Real-time slot updates via WebSocket
- [ ] SendGrid/Nodemailer email integration
- [ ] Google Calendar sync
- [ ] Multi-consultant support with dynamic scheduling
- [ ] Refresh token rotation
- [ ] Rate limiting per user (not just per IP)

---

## 📋 Türkçe Proje Özeti

Bu proje, modern bir full-stack randevu sistemidir:

- 🔐 **Güvenli auth:** JWT token'ları HttpOnly cookie'lerde saklanır
- ⚡ **Race condition koruması:** Veritabanı seviyesinde UNIQUE constraint
- 🔗 **Full-stack tip güvenliği:** Paylaşılan Zod şemaları
- 🚫 **Geçmiş zaman koruması:** Tarih ve saat validasyonu
- 🧪 **Kapsamlı testler:** 21 test, hepsi geçti