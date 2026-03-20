# SLIIT Event Management System

<div align="center">

![SLIIT Logo](frontend/public/wiramaya-2024-11.jpeg)

**IT3040 — Information Technology Project Management**
**BSc (Hons) in Information Technology · Year 3 · Semester 2 · 2026**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE.md)
[![Status](https://img.shields.io/badge/Status-In%20Development-yellow?style=for-the-badge)]()
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green?style=for-the-badge)]()

</div>

---

## 📌 Overview

The **SLIIT Event Management System** is a full-stack web application that enables SLIIT students, organizers, and administrators to manage university events end-to-end. Built on the **MERN stack** with a **microservice architecture**, the platform provides:

- Smart venue scheduling with **automatic conflict detection**
- **Real-time announcements** via Socket.IO
- **Role-based access control** (Participant / Organizer / Admin)
- QR-based attendance tracking
- Ticket booking and merchandise ordering
- A comprehensive admin dashboard with event approval workflows

> This project is based on the open-source [Univent](https://github.com/AbhishekBalija/Univent) project by Abhishek Balija, significantly modified and extended for SLIIT's ITPM module.

---

## ✨ Features by Module

### 🗓️ Event Lifecycle Management

- Organizers submit events with **venue, date, start time, and duration**
- **Automatic conflict detection**: if the venue is already booked at the requested time, the system returns the conflicting event's details and blocks the submission
- **Calendar Day View** API: shows all events at a venue for a given date, sorted by start time
- **Slot availability checker**: frontend can query any venue/date/time combination before submitting
- Event **status lifecycle**: `Pending → Approved → Completed / Cancelled`
- Admin-only status update endpoint with optional cancellation reason

### 🔐 Authentication, QR & Feedback

- Secure user registration and login using **JWT tokens** (access + refresh)
- **Google OAuth** sign-in (single step — no college prompt)
- Email-based **password reset** with 30-minute expiry token
- QR code generation for each registered participant
- QR **attendance scanning** at event entrance
- **Star rating feedback** system (1–5 stars) with optional anonymous mode

### 🎫 Tickets & Merchandise

- Book free or paid event tickets; each ticket has a **unique QR code**
- **Ticket verification** scan prevents duplicate entry
- **Merchandise catalog** with stock management
- Order tracking: `Placed → Processing → Ready for Pickup → Completed`

### 🛡️ Admin Dashboard

- Overview dashboard: total users, events, pending approvals, revenue
- **User management**: search, filter, assign roles (Participant / Organizer / Admin)
- **Event approval**: approve or reject pending events with a required reason on rejection
- System settings panel for platform configuration

---

## 🛠️ Technology Stack

| Layer            | Technology                                         |
| ---------------- | -------------------------------------------------- |
| Frontend         | React.js (Vite) + TailwindCSS + Redux Toolkit      |
| Backend          | Node.js + Express.js (Microservices)               |
| Database         | MongoDB Atlas + Mongoose                           |
| Real-time        | Socket.IO                                          |
| Authentication   | JWT (Access + Refresh tokens) + Google OAuth 2.0   |
| Email            | Nodemailer (Ethereal for dev, SMTP for production) |
| Testing          | Playwright / Cypress                               |
| Containerisation | Docker + Docker Compose                            |
| Version Control  | Git + GitHub                                       |

---

## 🏛️ Microservice Architecture

```
┌─────────────────────────────────────────────────────┐
│              React Frontend  :5173                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│                API Gateway  :8000                   │
└────┬──────────┬──────────┬──────────┬──────────┬───┘
     │          │          │          │          │
 :8001       :8002      :8003      :8004      :8005
auth-      event-    notific-  leaderboard  settings-
service    service    service    service     service
                                              :8006 (planned)
                                            ticket-service
```

**Service responsibilities:**

| Service                    | Port | Responsibility                                                 |
| -------------------------- | ---- | -------------------------------------------------------------- |
| auth-service               | 8001 | Registration, login, JWT, Google OAuth, password reset         |
| event-service              | 8002 | Event CRUD, venue conflict detection, participant registration |
| notification-service       | 8003 | Real-time announcements via Socket.IO                          |
| leaderboard-service        | 8004 | Participant scoring and live leaderboard updates               |
| settings-service           | 8005 | System and user settings                                       |
| ticket-service _(planned)_ | 8006 | Ticket booking, QR generation, merchandise                     |
| gateway                    | 8000 | Single entry point, request routing                            |

---

## 🌿 Git Branch Strategy

| Branch                   | Owner                 | Purpose                                            |
| ------------------------ | --------------------- | -------------------------------------------------- |
| `main`                   | B.H. Kavinda          | Production-ready, protected                        |
| `develop`                | B.H. Kavinda          | Integration — PRs merge here first                 |
| `feature/hirusha-events` | B.H. Kavinda          | Event lifecycle, conflict detection, calendar view |
| `feature/monal-auth`     | Y.M.K. Wikramasinghe  | Auth, Google OAuth, QR, feedback                   |
| `feature/even-tickets`   | Munasinghe M.A.E.S    | Tickets, merchandise, orders                       |
| `feature/venura-admin`   | Wikramasingha W.M.V.U | Admin dashboard, approvals                         |

---

## 🏁 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB Atlas account (or local MongoDB v6+)
- npm v9+
- Docker _(optional, for containerised setup)_

### 1 — Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/SLIIT-Event-Management-System.git
cd SLIIT-Event-Management-System
```

### 2 — Environment variables

Create a `.env` file inside **each** backend service folder. Example for `backend/auth-service/.env`:

```env
PORT=8001
MONGODB_URI_AUTH=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/sliit_auth

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=1d
JWT_REFRESH_SECRET=your_refresh_secret_here
JWT_REFRESH_EXPIRE=7d

NODE_ENV=development

# Email (Ethereal auto-created in dev — no config needed)
# For production, set:
# EMAIL_SERVICE=gmail
# EMAIL_USER=your@gmail.com
# EMAIL_PASS=app_password

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Repeat for `event-service`, `notification-service`, `leaderboard-service`, `settings-service`, and `gateway` — each with their own `PORT` and `MONGODB_URI_*`.

### 3 — Install and start each service

Open a separate terminal for each:

```bash
cd backend/auth-service          && npm install && npm start   # :8001
cd backend/event-service         && npm install && npm start   # :8002
cd backend/notification-service  && npm install && npm start   # :8003
cd backend/leaderboard-service   && npm install && npm start   # :8004
cd backend/settings-service      && npm install && npm start   # :8005
cd backend/gateway               && npm install && npm start   # :8000
cd frontend                      && npm install && npm run dev  # :5173
```

### 4 — Open the app

```
http://localhost:5173
```

### Docker (optional)

```bash
docker-compose up --build
```

---

---

## 🔌 Key API Endpoints

### Auth Service `:8001`

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| POST   | `/api/auth/register`              | Register new user         |
| POST   | `/api/auth/login`                 | Login                     |
| GET    | `/api/auth/me`                    | Get current user profile  |
| PUT    | `/api/auth/profile`               | Update profile            |
| POST   | `/api/auth/google`                | Google OAuth login        |
| POST   | `/api/auth/forgot-password`       | Send password reset email |
| POST   | `/api/auth/reset-password/:token` | Reset password            |
| POST   | `/api/auth/refresh-token`         | Refresh JWT               |

### Event Service `:8002`

| Method | Endpoint                       | Description                        |
| ------ | ------------------------------ | ---------------------------------- |
| GET    | `/api/events`                  | List all events (with filters)     |
| POST   | `/api/events`                  | Create event _(organizer/admin)_   |
| GET    | `/api/events/:id`              | Get event by ID                    |
| PUT    | `/api/events/:id`              | Update event                       |
| DELETE | `/api/events/:id`              | Delete event                       |
| PUT    | `/api/events/:id/status`       | Update event status _(admin only)_ |
| POST   | `/api/events/:id/register`     | Register for event                 |
| DELETE | `/api/events/:id/register`     | Cancel registration                |
| GET    | `/api/events/:id/participants` | Get participant list               |
| GET    | `/api/events/calendar/:date`   | Get events for a specific date     |
| GET    | `/api/events/check-slot`       | Check venue availability           |

---

## 🤝 Contributing (Team Workflow)

1. Pull latest from `develop`
   ```bash
   git checkout develop && git pull origin develop
   ```
2. Work on your feature branch
   ```bash
   git checkout feature/your-branch
   ```
3. Commit often with clear messages
4. Push and open a Pull Request → `develop`
5. Hirusha reviews and merges
6. `develop` → `main` only before milestone demos

---

<div align="center">
  <sub>SLIIT Event Management System · IT3040 ITPM 2025 · Group 279</sub>
</div>
