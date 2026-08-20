# BX Analytics — Member Activity Tracking & Analytics Platform

A modern, production-grade developer platform and analytics dashboard built for the **BX Technical Club** using the **MERN Stack** (MongoDB + Express.js + React + Node.js).

---

## ✨ Features

- **Role-Based Access Control**:
  - **Super Admin**: Manage members, roles, club events, platform integrations, reports, and system settings.
  - **Core Lead**: Audit attendance, project event QR codes, view deep analytics, manage events.
  - **Club Member**: Manage developer profile links (GitHub, LeetCode, Codeforces, Kaggle, LinkedIn, etc.), scan QR codes to mark attendance, and track personal score progression.
- **MongoDB Session-Based Authentication**: Secure cookie-based express sessions stored in MongoDB Atlas (`express-session` + `connect-mongo`).
- **Automated Platform Ingestion Engine**:
  - **GitHub**: Commit logs, public repos, PR merges, stars received.
  - **LeetCode**: Solved problems breakdown (Easy, Medium, Hard), contest rating.
  - **Codeforces**: Rating progression, contest history, rank tier.
  - **Kaggle**: Competitions, notebooks, medals.
  - **Mock Data Engine (`USE_MOCK_DATA=true`)**: Ensures the dashboard is 100% functional and demonstrable immediately without third-party API rate limits.
- **Attendance & QR System**:
  - Instant high-density QR code pass generation for workshops and hackathons.
  - Fullscreen QR projector for event leads.
  - Built-in camera QR scanner and token punch for members.
  - Duplicate prevention & streak tracking.
- **Concrete Contributions & Scoring**:
  - Real verified contribution logs (PRs, speaker sessions, project leads, hackathon wins).
  - Dynamic score computation.
- **Deep Analytics & Recharts**:
  - KPI Stat Cards, 6-Month Chronological Activity Area Charts, Platform Share Donut, Attendance Trend Bars, and Department / Year Engagement.
- **Audit Reports & Exports**:
  - Instant PDF Generation with jsPDF & AutoTable.
  - CSV Data Export.

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd backend
npm install
```

Make sure your `backend/.env` file has your MongoDB connection URI:

```env
PORT=5000
MONGODB_URI=mongodb+srv://preetimantur11_db_user:xB9KxxWlfLXZIHRr@<cluster>.mongodb.net/bx_analytics?retryWrites=true&w=majority
SESSION_SECRET=bx_analytics_session_secret_key_secure_2026
USE_MOCK_DATA=true
```

> **Note**: Replace `<cluster>` in `MONGODB_URI` with your actual MongoDB Atlas cluster name (e.g. `cluster0.abcde`) or `mongodb://127.0.0.1:27017/bx_analytics` for local MongoDB.

#### Seed Demo Data

Populates 20+ members across CSE, ISE, ECE, EEE, ME, AIDS, club events, QR tokens, and 6 months of historical activity:

```bash
npm run seed
```

#### Start Backend Server

```bash
npm run dev
# or: npm start
```

Backend will run on `http://localhost:5000`.

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend UI will open on `http://localhost:5173`.

---

## 🔑 Demo Credentials (Password for all: `password123`)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `admin@bx.club` | `password123` |
| **Core Lead** | `lead@bx.club` | `password123` |
| **Club Member** | `member@bx.club` | `password123` |
