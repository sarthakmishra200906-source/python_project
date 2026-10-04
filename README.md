# ⚡ RechargeX — Mobile Recharge System

> A full-stack college project simulating a telecom self-care portal (MyJio-inspired), built with **React + Flask + MySQL**.

![Tech Stack](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Flask](https://img.shields.io/badge/Flask-3.0-green?logo=flask)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue?logo=mysql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-ff6384?logo=chartdotjs)

---

## 🗂️ Project Structure

```
mobile-recharge-system/
├── backend/                  # Python Flask REST API
│   ├── app.py                # Entry point
│   ├── config.py             # MySQL + app settings
│   ├── requirements.txt      # Python deps
│   ├── db/
│   │   ├── schema.sql        # DB schema + 14 seed plans
│   │   └── connection.py     # MySQL connection pool
│   ├── models/               # DB query functions
│   └── routes/               # API route blueprints
└── frontend/                 # React (Vite) SPA
    ├── src/
    │   ├── pages/            # Login, Dashboard, Plans, History, PaymentSuccess
    │   ├── components/       # Navbar, HeroCarousel, Footer, PlanCard, Charts...
    │   ├── context/          # AuthContext, ThemeContext
    │   └── api/              # Axios client
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+ running locally

### Step 1 — Setup MySQL Database

```bash
# Login to MySQL and run the schema
mysql -u root -p < backend/db/schema.sql
```

### Step 2 — Backend (Flask)

```bash
cd backend
pip install -r requirements.txt
python app.py
# API running on http://localhost:5000
```

### Step 3 — Frontend (React)

```bash
cd frontend
npm install
npm run dev
# App running on http://localhost:5173
```

---

## 🔑 Default MySQL Config

The backend reads from environment variables. Defaults:

| Variable | Default |
|---|---|
| `MYSQL_HOST` | `localhost` |
| `MYSQL_PORT` | `3306` |
| `MYSQL_USER` | `root` |
| `MYSQL_PASSWORD` | `root` |
| `MYSQL_DB` | `recharge_db` |

Create a `.env` file in `backend/` to override:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DB=recharge_db
```

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔐 Auth | Sign Up / Login with bcrypt-hashed passwords |
| 🏠 Landing Page | Hero carousel with 3 animated slides (auto-advances every 4.5s) |
| 📊 Dashboard | Account info + 3 Chart.js charts (Doughnut, Bar, Line) |
| 📋 Plans | 14 plans in 4 categories with search + filter |
| 💳 Mock Payment | Animated progress → success screen with confetti |
| 📜 History | Paginated transaction table with status filters |
| 🌙 Dark/Light Mode | System-aware, persisted in localStorage |
| 📱 Responsive | Mobile-first, works on all screen sizes |

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Authenticate user |
| `GET` | `/api/plans` | All 14 plans |
| `GET` | `/api/plans/category/<cat>` | Plans by category |
| `GET` | `/api/dashboard/<id>` | Account + chart data |
| `POST` | `/api/recharge` | Process mock recharge |
| `GET` | `/api/history/<id>` | Transaction history |
| `GET` | `/api/health` | Server health check |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3 |
| Charts | Chart.js 4 + react-chartjs-2 |
| Routing | React Router v6 |
| HTTP | Axios |
| Backend | Python Flask 3, Flask-CORS |
| Auth | bcrypt password hashing |
| Database | MySQL 8 with connection pooling |

---

*Built for college project demonstration — 2024*
