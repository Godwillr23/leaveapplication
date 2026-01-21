# Leave Application

Simple leave management app (React frontend + Node/Express + MongoDB backend).

Quick start

- Backend
  - cd backend
  - copy `.env.example` to `.env` and fill values (do NOT commit `.env`)
  - npm install
  - npm run dev

- Frontend
  - cd frontend
  - npm install
  - npm start

Security

- Ensure you never commit secrets. `.env` files are ignored by default.
- If you accidentally committed secrets, rotate them and remove from history.

Repository

Create a GitHub repo under your account (for example: `Godwillr23/leaveapplication`) and push the code.
# Leave Application (monorepo)

This project contains backend and frontend folders:

- `backend` — Node.js + Express + MongoDB API
- `frontend` — React app (minimal scaffold)

Run backend:

```bash
cd leaveapplication/backend
npm install
cp .env.example .env
# edit .env
npm run seed
npm run dev
```

Run frontend:

```bash
cd leaveapplication/frontend
npm install
npm start
```
