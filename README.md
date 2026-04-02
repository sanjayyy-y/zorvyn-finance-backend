# Finance Data Processing and Access Control Backend

A robust backend system for managing financial records, user roles, and dashboard analytics — built with Node.js, Express, and MongoDB.

---

##  Project Structure

```
Backend/
├── server.js                        # Entry point — boots Express & connects to MongoDB
├── seed.js                          # Populates DB with test users & transactions
├── tests.js                         # Smoke test script hitting every endpoint
├── .env.example                     # Template for environment variables
│
└── src/
    ├── app.js                       # Express app configuration & middleware stack
    ├── config/
    │   └── db.js                    # Mongoose connection handler
    ├── models/
    │   ├── User.js                  # User schema with bcrypt pre-save hook
    │   ├── Transaction.js           # Transaction schema with soft-delete & indexes
    │   └── AuditLog.js              # Immutable log of all write operations
    ├── middlewares/
    │   ├── authMiddleware.js        # JWT verification + role-based guards
    │   ├── errorHandler.js          # Centralized error handler (dev vs prod)
    │   └── validate.js              # Zod schema validation middleware
    ├── controllers/                 # Thin HTTP handlers (zero business logic)
    │   ├── AuthController.js
    │   ├── UserController.js
    │   ├── TransactionController.js
    │   └── DashboardController.js
    ├── services/                    # Core business logic & DB operations
    │   ├── AuthService.js
    │   ├── UserService.js
    │   ├── TransactionService.js
    │   ├── DashboardService.js
    │   └── AuditService.js
    ├── routes/                      # Express routers with middleware chains
    │   ├── index.js
    │   ├── authRoutes.js
    │   ├── userRoutes.js
    │   ├── transactionRoutes.js
    │   └── dashboardRoutes.js
    ├── validations/                 # Zod schemas for request validation
    │   ├── auth.validation.js
    │   ├── user.validation.js
    │   └── transaction.validation.js
    └── utils/
        ├── AppError.js              # Custom operational error class
        └── catchAsync.js            # Async error wrapper for controllers
```

---

##  Architectural Decisions

### 1. Service Layer Pattern
Controllers are intentionally kept thin — they extract request data and return responses, nothing more. All business logic, database queries, and data manipulation live in the **Service layer**. This keeps the codebase testable and maintainable as it scales.

### 2. Validation at the Edge (Zod)
Every incoming request passes through a Zod validation middleware before reaching the controller. Malformed payloads (missing fields, wrong types, negative amounts) are rejected with descriptive error messages at the boundary, keeping the core logic clean.

### 3. Soft Deletes & Audit Trails
In real financial systems, data should never be permanently destroyed.
- **Soft Delete**: Deleting a transaction sets `isDeleted: true`. A Mongoose `pre('find')` middleware automatically hides these from all queries and aggregations.
- **Audit Logging**: An `AuditService` records every `CREATE`, `UPDATE`, and `DELETE` action — capturing who did it and what changed. This is fire-and-forget (audit failures don't crash the main request).

### 4. MongoDB Aggregation Pipelines
The Dashboard endpoints (`/summary`, `/trends`) use native MongoDB aggregation pipelines rather than pulling records into Node.js memory. This pushes computation to the database where it belongs — critical for performance with large datasets.

### 5. Role-Based Access Control (RBAC)
The `restrictTo()` middleware is a declarative guard applied at the route level. Combined with the `protect` middleware (which verifies the JWT and checks if the user is still active), every route is explicitly gated.

---

##  Access Control Matrix

| Action | Viewer | Analyst | Admin |
|---|:---:|:---:|:---:|
| View dashboard (summary/trends) | ❌ | ✅ | ✅ |
| List / read transactions | ❌ | ✅ | ✅ |
| Create transactions | ❌ | ❌ | ✅ |
| Update transactions | ❌ | ❌ | ✅ |
| Delete transactions (soft) | ❌ | ❌ | ✅ |
| Manage users (roles/status) | ❌ | ❌ | ✅ |

---

## 🛠 Tech Stack
| Layer | Technology |
|---|---|
| Runtime | Node.js (v18+) |
| Framework | Express.js |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT + bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS |
| Dev Tooling | Nodemon, Morgan |

---

## 💻 Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB instance (local or [MongoDB Atlas](https://cloud.mongodb.com))

### 1. Clone & Install
```bash
git clone <repo-url>
cd Backend
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```
Then fill in your `MONGO_URI` and `JWT_SECRET` in the `.env` file.

### 3. Seed the Database
```bash
node seed.js
```
This creates 3 test accounts and 5 sample transactions:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@finance.com` | `password123` |
| Analyst | `analyst@finance.com` | `password123` |
| Viewer | `viewer@finance.com` | `password123` |

### 4. Start the Server
```bash
npm run dev
```
Server runs at `http://localhost:5000`. Hit `http://localhost:5000/health` to verify.

### 5. Run Smoke Tests (Optional)
With the server running, open a second terminal:
```bash
node tests.js
```
This hits all 15 endpoints and prints ✅ / ❌ for each test case.

---

## 🔗 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user (defaults to `VIEWER` role) |
| `POST` | `/login` | Login and receive a JWT token |

### Users (`/api/users`) — Admin Only
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | List all users |
| `PATCH` | `/:id/role` | Update a user's role |
| `PATCH` | `/:id/status` | Activate / deactivate a user |

### Transactions (`/api/transactions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/` | Analyst, Admin | List with pagination (`?page=1&limit=10`) and filters (`?type=INCOME&category=Salary&startDate=2026-01-01&endDate=2026-03-31`) |
| `GET` | `/:id` | Analyst, Admin | Get single transaction |
| `POST` | `/` | Admin | Create a transaction |
| `PUT` | `/:id` | Admin | Update a transaction |
| `DELETE` | `/:id` | Admin | Soft-delete a transaction |

### Dashboard (`/api/dashboard`) — Analyst & Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/summary` | Total income, total expenses, net balance, category-wise breakdown |
| `GET` | `/trends` | Month-by-month income, expense, and net trends |

---

##  Assumptions & Trade-offs

1. **Registration defaults to VIEWER** — Public sign-ups get the lowest clearance. Only an Admin can elevate roles. This prevents privilege escalation via the registration endpoint.
2. **Skip/Limit pagination** — Chosen over cursor-based pagination because the dataset size for a finance dashboard is typically moderate, and skip/limit is simpler to implement and consume on the frontend.
3. **Audit logs are fire-and-forget** — If an audit log write fails, it logs to `stderr` but doesn't crash the main transaction. Financial data integrity takes priority over audit completeness.
4. **No password reset flow** — Out of scope for this assignment, but the bcrypt hashing and JWT infrastructure make it straightforward to add.
5. **Soft delete hides from all queries** — The `pre('find')` middleware on the Transaction model ensures soft-deleted records are invisible to both regular queries and aggregation-based dashboard endpoints.

---

##  What I'd Add With More Time

- Rate limiting (express-rate-limit) to protect auth endpoints
- Unit tests with Jest/Supertest
- API documentation with Swagger/OpenAPI
- Password reset via email
- Request logging to a persistent store
- Docker Compose for one-command local setup

---

Thank you for reviewing the assignment!
