# Leave System Backend

This is a simple leave application backend (Node.js + Express + MongoDB).

Setup

1. Copy `.env.example` to `.env` and fill values (especially `MONGO_URI` and SMTP settings).
2. Install deps:

```bash
cd backend
npm install
```

3. Seed sample users:

```bash
npm run seed
```

4. Run:

```bash
npm run dev
```

API endpoints (examples)

- `POST /api/auth/register` — register user
- `POST /api/auth/login` — login, returns JWT
- `POST /api/leaves/apply` — apply for leave (authenticated)
- `POST /api/leaves/:id/approve` — manager approves
- `POST /api/leaves/:id/decline` — manager declines
- `POST /api/leaves/:id/escalate` — HR/manager escalate
- `GET /api/leaves/dashboard` — role-based dashboard

Accrual logic

Annual leave accrues at 1.5 days per month up to 18 days total. The system calculates months since `hireDate`.
