# Finance Data Processing and Access Control Backend

This repository contains the backend implementation for the Finance Data Processing and Access Control system. It is built to demonstrate production-ready architectural patterns, strong data integrity, and strict access control mechanisms.

## 🚀 Key Features and Architectural Decisions

This is not just a standard CRUD app. I implemented several patterns to make this project robust:

### 1. N-Tier Architecture (Separation of Concerns)
Instead of putting all the logic in the Express Controllers, this application uses a **Service Layer** pattern:
- **Routes** (`src/routes`): Mount endpoints and attach middlewares.
- **Controllers** (`src/controllers`): Extract data from the request, pass it to the service, and format the response. Contains zero business logic.
- **Services** (`src/services`): Where the actual business logic, database queries, and data manipulation live.

### 2. Validation First with Zod
Inputs are validated at the edge using **Zod**. If a request payload is malformed (e.g. missing fields, wrong types, non-positive amounts), it is rejected before it even hits the controller, keeping our core logic clean.

### 3. Data Integrity: Soft Deletes & Audit Trails
In real financial systems, data is rarely hard-deleted.
- **Soft Deletes**: Deleting a transaction flips an `isDeleted` flag. A Mongoose middleware (`pre('find')`) ensures these records are hidden from standard queries and aggregations by default.
- **Audit Logs**: An `AuditService` automatically tracks all `CREATE`, `UPDATE`, and `DELETE` mutations. This makes the system highly accountable.

### 4. Advanced Aggregations
The Dashboard APIs (`/api/dashboard/summary` and `/api/dashboard/trends`) utilize MongoDB **Aggregation Pipelines** built within the `DashboardService`. These offload data crunching directly to the database layer rather than pulling all records into Node.js memory.

### 5. Role-Based Access Control (RBAC)
Role guards use a declarative approach on the routes: `authMiddleware.restrictTo('ANALYST', 'ADMIN')`. 
- **Viewers** can read specific low-clearance data.
- **Analysts** can read transactions and view the aggregation dashboards.
- **Admins** have full write capabilities to users and transactions.

---

## 🛠 Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Validation**: Zod
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs

---

## 💻 Running the Project Locally

### Prerequisites
- Node.js (v18+)
- Local MongoDB running on `mongodb://localhost:27017` or a MongoDB Atlas URI.

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Ensure the local `.env` file exists in the root directory:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/finance_dashboard
JWT_SECRET=super_secret_jwt_key_for_development
JWT_EXPIRES_IN=90d
```

### 3. Seed the Database
To quickly test the application, run the seed script. This will populate the Database with default users (including an Admin) and some mock transactions.
```bash
node seed.js
```
**Test Accounts Created:**
- Admin: `admin@finance.com` / `password123`
- Analyst: `analyst@finance.com` / `password123`
- Viewer: `viewer@finance.com` / `password123`

### 4. Start the Server
```bash
npm run dev
```
The server will run at `http://localhost:5000/api`

---

## 🔗 Endpoint Summary

### Authentication (`/api/auth`)
- `POST /register`
- `POST /login`

### Users (`/api/users`) - ADMIN Only
- `GET /` - List all users
- `PATCH /:id/role` - Update a user's role
- `PATCH /:id/status` - Update a user's status (`ACTIVE`/`INACTIVE`)

### Transactions (`/api/transactions`) 
- `GET /` - List transactions (Supports Pagination with `?page=1&limit=10` and filtering `?type=INCOME&category=Salary`) (Analyst & Admin)
- `GET /:id` - Get a specific transaction
- `POST /` - Create a transaction (Admin only)
- `PUT /:id` - Update a transaction (Admin only)
- `DELETE /:id` - Soft Delete a transaction (Admin only)

### Dashboard (`/api/dashboard`) - Analyst & Admin Only
- `GET /summary` - Returns `totalIncome`, `totalExpense`, `netBalance`, and `categoryBreakdown`
- `GET /trends` - Returns month-by-month aggregated trends

---

## 🤔 Assumptions Made
- Email is used as the primary identifier for authentication.
- Upon registration via the public endpoint, a user is automatically assigned the lowest clearance (`VIEWER`). An Admin must elevate their privileges.
- Standard skip/limit pagination is suitable since high-speed infinite scrolling wasn't a strict requirement, and skip/limit is sufficient for dashboard tables.

Thank you for reviewing the assignment!
