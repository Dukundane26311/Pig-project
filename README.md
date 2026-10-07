# 🐷 Pig Project Revolving Fund

**Value Protocols Rwanda**

> *"One Piglet. One Family. A Fund That Keeps Moving."*

---

## Overview

The **Pig Project Revolving Fund** is a full-stack management platform for Value Protocols Rwanda — an NGO running a pig revolving fund program.

**Core Model:**
A vulnerable family receives a pig → the pig reproduces → the family returns 3 piglets → those piglets are redistributed to the next family → the cycle continues.

---

## Architecture

```
User Browser
    │
    ▼
Next.js Frontend (Netlify)
    │ HTTPS REST API
    ▼
FastAPI Backend (Render / Railway / Fly.io)
    │
    ▼
PostgreSQL Database (Managed)
```

---

## Project Structure

```
pig-project/
├── frontend/          # Next.js + TypeScript + Tailwind
├── backend/           # Python FastAPI + SQLAlchemy + Alembic
├── docker-compose.yml # Local development
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.12+
- PostgreSQL 16+ (or Docker)

### 1. Clone & Start Database

```bash
# With Docker (recommended):
docker-compose up db -d

# Or use your local PostgreSQL instance
```

### 2. Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows PowerShell)
.venv\Scripts\Activate.ps1

# Activate (macOS/Linux)
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your values

# Run database migrations
alembic upgrade head

# Seed initial data
python -m app.db.seed

# Start development server
uvicorn app.main:app --reload --port 8000
```

Backend API: http://localhost:8000  
API Docs: http://localhost:8000/docs  
ReDoc: http://localhost:8000/redoc

### 3. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

Frontend: http://localhost:3000

---

## Default Credentials (Development)

> ⚠️ Change immediately in production!

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@valueprotocols.rw | admin123 |

The backend seeds this account automatically on first run. Use these values when signing in at http://localhost:3000/login.

---

## Running Tests

```bash
cd backend
pytest tests/ -v
```

---

## Production Deployment

### Backend (Render / Railway / Fly.io)

1. Push to GitHub
2. Connect repository to your hosting provider
3. Set environment variables (see `backend/.env.example`)
4. Set start command: `gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT`
5. Run migrations on deploy: `alembic upgrade head`

### Frontend (Netlify)

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Set `NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`

### Database

Use managed PostgreSQL:
- [Neon](https://neon.tech) — Free tier available
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- [Amazon RDS](https://aws.amazon.com/rds/)

---

## Environment Variables

See:
- `backend/.env.example`
- `frontend/.env.example`

---

## API Documentation

- Swagger UI: `https://api.yourdomain.com/docs`
- ReDoc: `https://api.yourdomain.com/redoc`

---

## Security

- JWT authentication (access + refresh tokens)
- Argon2 password hashing
- Role-Based Access Control (RBAC)
- OTP for sensitive operations
- Audit logging
- Rate limiting
- CORS restrictions
- SQL injection protection via SQLAlchemy ORM
- No secrets in repository

---

## License

Proprietary — Value Protocols Rwanda
