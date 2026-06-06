# Order Management System (OMS)

A full-stack web application for managing purchase orders with role-based access control. Creators raise and submit orders; Purchasers review, approve, complete, or return them.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [User Roles](#user-roles)
- [Order Lifecycle](#order-lifecycle)
- [API Reference](#api-reference)
- [Default Users](#default-users)

---

## Features

- JWT-based authentication with 24-hour token expiry
- Role-based UI and API access (Creator / Purchaser)
- Full order lifecycle: Draft → Submitted → Approved → Completed
- Business rule enforcement: no two submitted orders can share the same items
- H2 file-based database (zero external DB setup)
- Password change for all users

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 17, Spring Boot 3.2.5, Spring Security, Spring Data JPA |
| Auth | JJWT 0.12.3 (HS256 JWT tokens) |
| Database | H2 (file-based, auto-created at `backend/data/oms`) |
| Frontend | React 18, Vite 5, React Router 6, Axios |

---

## Project Structure

```
inventory-management/
├── backend/                    # Spring Boot application (port 8085)
│   ├── src/main/java/com/oms/
│   │   ├── auth/               # Login, JWT filter, change password
│   │   ├── config/             # Security, CORS, JPA config
│   │   ├── order/              # Order entity, service, controller, DTOs
│   │   └── user/               # User entity, roles, service, controller
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/                   # React + Vite application (port 4000)
│   ├── src/
│   │   ├── api/                # Axios instance with JWT interceptors
│   │   ├── components/         # NavBar, PrivateRoute, StatusBadge
│   │   ├── context/            # AuthContext (global auth state)
│   │   └── pages/              # Login, Orders, Create/Edit, Detail, ChangePassword
│   ├── vite.config.js
│   └── package.json
└── docs/
```

---

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+ and npm

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd inventory-management
```

### 2. Start the backend

```powershell
cd backend
mvn spring-boot:run
```

The API starts at `http://localhost:8085`.  
The H2 console is available at `http://localhost:8085/h2-console` (JDBC URL: `jdbc:h2:file:./data/oms`, user: `sa`, no password).

### 3. Start the frontend

Open a new terminal:

```powershell
cd frontend
npm install
npm run dev
```

The app is available at `http://localhost:4000`.

---

## User Roles

### Creator
- Create orders (saved as **Draft**)
- Edit draft orders
- Submit orders to the Purchaser
- Amend and resubmit returned or rejected orders

### Purchaser
- View all submitted, approved, completed, rejected, and returned orders
- Approve submitted orders
- Complete approved orders (with a transaction reference)
- Reject or return submitted orders for amendments

---

## Order Lifecycle

```
                  ┌──────────┐
                  │  DRAFT   │◄─────────────────┐
                  └────┬─────┘                   │
                       │ Submit (Creator)         │ Amend & Resubmit
                  ┌────▼─────┐                   │
                  │SUBMITTED │──── Return ────────┘
                  └────┬─────┘
          ┌────────────┤
     Approve       Reject
          │            │
    ┌─────▼────┐  ┌────▼─────┐
    │ APPROVED │  │ REJECTED │
    └─────┬────┘  └──────────┘
          │ Complete (with transaction ref)
    ┌─────▼─────┐
    │ COMPLETED │
    └───────────┘
```

> **Business rule:** No two orders in **Submitted** or **Approved** status can contain the same item at the same time.

---

## API Reference

All endpoints are prefixed with `/api`. Protected endpoints require the header:
```
Authorization: Bearer <jwt-token>
```

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | None | Login and receive JWT |
| POST | `/api/auth/change-password` | Required | Change current user's password |

**Login request body:**
```json
{
  "username": "creator1",
  "password": "password"
}
```

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | Required | Get current user profile |

### Orders

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | `/api/orders` | Both | List orders (filtered by role) |
| POST | `/api/orders` | Creator | Create a new draft order |
| GET | `/api/orders/{id}` | Both | Get order details |
| PUT | `/api/orders/{id}` | Creator | Update a draft order |
| POST | `/api/orders/{id}/submit` | Creator | Submit order for review |
| POST | `/api/orders/{id}/approve` | Purchaser | Approve a submitted order |
| POST | `/api/orders/{id}/complete` | Purchaser | Complete an approved order |
| POST | `/api/orders/{id}/return` | Purchaser | Return order for amendments |
| POST | `/api/orders/{id}/reject` | Purchaser | Reject a submitted order |

---

## Default Users

The application seeds the following users on startup:

| Username | Password | Role |
|----------|----------|------|
| `creator1` | `password` | Creator |
| `creator2` | `password` | Creator |
| `purchaser1` | `password` | Purchaser |
| `purchaser2` | `password` | Purchaser |
