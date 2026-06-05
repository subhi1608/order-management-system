# Order Management System — Design Spec
**Date:** 2026-06-05
**Status:** Approved

---

## 1. Overview

An Order Management System for office supplies. A **Creator** (office admin) raises purchase requests. A **Purchaser** processes them offline, then marks them complete with a transaction reference. Includes a return/amend loop: Purchaser can send an order back to the Creator for amendment before it is resubmitted.

---

## 2. Technology Stack

| Layer | Technology | Port |
|---|---|---|
| Frontend | React + Vite | 4000 |
| Backend | Java Spring Boot 3.x | 8085 |
| Database | H2 file-mode (JPA) | embedded |
| Auth | JWT (JJWT), BCrypt passwords | — |

---

## 3. Architecture

```
React + Vite (port 4000)
        │
        │  HTTP/JSON  (Authorization: Bearer <jwt>)
        ▼
Spring Boot REST API (port 8085)
   ├── AuthController      /api/auth/**
   ├── OrderController     /api/orders/**
   └── UserController      /api/users/**
        │
        ▼
   Spring Data JPA
        │
        ▼
   H2 File DB  (./data/oms.mv.db)
```

- `JwtFilter` intercepts every request, validates the token, and populates `SecurityContext`.
- Role-based access enforced via `@PreAuthorize` on controller methods.
- CORS configured on the backend to allow `http://localhost:4000`.
- React stores JWT in `localStorage`; an axios interceptor attaches it to every request.

---

## 4. Data Model

### User
| Field | Type | Notes |
|---|---|---|
| id | Long (PK) | auto-generated |
| username | String | unique, not null |
| password | String | BCrypt hashed |
| role | Enum | `CREATOR`, `PURCHASER` |

### Order
| Field | Type | Notes |
|---|---|---|
| id | Long (PK) | auto-generated |
| title | String | short description |
| status | Enum | see status flow below |
| createdBy | FK → User | only this user can edit |
| expiresAt | LocalDate | order expiry date |
| purchaserNote | String | nullable — set on RETURN or REJECT |
| txnReference | String | nullable — set on COMPLETE |
| createdAt | LocalDateTime | auto-set |
| updatedAt | LocalDateTime | auto-set |

### OrderItem
| Field | Type | Notes |
|---|---|---|
| id | Long (PK) | auto-generated |
| order | FK → Order | cascade delete |
| itemName | String | not null |
| quantity | Integer | not null, > 0 |

### Duplicate Item Constraint
When an order transitions from `DRAFT` or `RETURNED` to `SUBMITTED`, the backend checks that no other order in status `SUBMITTED` or `APPROVED` contains any of the same `itemName` values (case-insensitive). If overlap is found, the submission is rejected with HTTP 409 and a list of conflicting item names.

---

## 5. Order Status Flow

```
           Creator                    Purchaser
              │
         [Create]
              │
           DRAFT ──── (edit)
              │
         [Submit] ── duplicate check ──► SUBMITTED
                                              │
                                         [Approve]
                                              │
                                          APPROVED
                                              │
                                         [Complete + txnRef]
                                              │
                                          COMPLETED


          RETURNED ◄──────────────── [Return + note]
              │
         [Amend & Resubmit]
              │
          SUBMITTED ──────────────────► REJECTED (final)
                                    [Reject + note]
```

**Transition rules:**
- `DRAFT` → editable by owning Creator only (title, items, qty, expiry)
- `DRAFT` → `SUBMITTED`: Creator submits; duplicate check runs
- `SUBMITTED` → `APPROVED`: Purchaser approves
- `APPROVED` → `COMPLETED`: Purchaser adds `txnReference` and completes
- `SUBMITTED` → `RETURNED`: Purchaser adds a note; order goes back to Creator
- `RETURNED` → `SUBMITTED`: Creator amends and resubmits; duplicate check runs again
- `SUBMITTED` → `REJECTED`: Purchaser rejects with note; final state, no further action

---

## 6. API Endpoints

### Auth
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Returns JWT + role + username |
| POST | `/api/auth/change-password` | Authenticated | Change own password |

### Orders
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/orders` | Both | List orders filtered by role |
| POST | `/api/orders` | Creator | Create new draft |
| GET | `/api/orders/{id}` | Both | Order detail + items |
| PUT | `/api/orders/{id}` | Creator (owner, DRAFT/RETURNED) | Edit order |
| POST | `/api/orders/{id}/submit` | Creator (owner) | DRAFT/RETURNED → SUBMITTED |
| POST | `/api/orders/{id}/approve` | Purchaser | SUBMITTED → APPROVED |
| POST | `/api/orders/{id}/complete` | Purchaser | APPROVED → COMPLETED |
| POST | `/api/orders/{id}/return` | Purchaser | SUBMITTED → RETURNED |
| POST | `/api/orders/{id}/reject` | Purchaser | SUBMITTED → REJECTED |

### Users
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/api/users/me` | Authenticated | Own profile details |

**`GET /api/orders` filtering:**
- Creator: only their own orders, all statuses.
- Purchaser: all orders except other users' DRAFTs (statuses: SUBMITTED, APPROVED, COMPLETED, REJECTED, RETURNED).

---

## 7. Frontend Pages & Routes

| Route | Role | Description |
|---|---|---|
| `/login` | Public | Login form |
| `/orders` | Both | Orders table (role-filtered) — default landing |
| `/orders/new` | Creator | Create order form |
| `/orders/:id` | Both | Order detail + action buttons |
| `/orders/:id/edit` | Creator (owner, DRAFT/RETURNED) | Edit order form |
| `/change-password` | Both | Change password form |

### Orders Table Columns
| Column | Creator | Purchaser |
|---|---|---|
| Title | ✓ | ✓ |
| Status | ✓ | ✓ |
| Items count | ✓ | ✓ |
| Expires At | ✓ | ✓ |
| Created At | ✓ | ✓ |
| Created By | — | ✓ |

### Order Detail — Context-aware Action Buttons
| User + Status | Actions available |
|---|---|
| Creator, DRAFT | Edit, Submit |
| Creator, RETURNED | Edit (see purchaser note), Submit |
| Purchaser, SUBMITTED | Approve, Return (+ note), Reject (+ note) |
| Purchaser, APPROVED | Complete (+ txnReference input) |
| Any, terminal states | Read-only |

### Auth / Routing
- `PrivateRoute` wrapper redirects unauthenticated users to `/login`.
- JWT and role stored in React context (populated from `localStorage` on app load).
- Axios interceptor attaches `Authorization: Bearer <token>` to every request.

---

## 8. Security

- Passwords hashed with BCrypt.
- JWT signed with HS256, expiry configurable (default 24h).
- CORS: Spring Security CORS config allows only `http://localhost:4000`.
- All endpoints except `/api/auth/login` require a valid JWT.
- Ownership checks enforced server-side (not just frontend): only the order's creator can edit/submit it.

---

## 9. Out of Scope

- Payment processing or financial transaction execution
- Email/notification system
- File uploads
- Pagination (nice-to-have but not required)
