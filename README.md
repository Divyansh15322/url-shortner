# ✂️ Snip — URL Shortener

A production-grade URL shortener built to showcase backend engineering, system design, and DevOps skills.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.12) |
| Database | PostgreSQL via Supabase |
| Caching | Redis |
| ORM | SQLAlchemy + Alembic |
| Auth | JWT + Passlib (bcrypt) |
| Frontend | React + Tailwind CSS |
| Container | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | AWS EC2 + S3 + CloudFront |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/youruser/snip.git && cd snip

# 2. Start everything
docker compose up --build

# 3. Run migrations
docker compose exec backend alembic upgrade head

# 4. Open
#   Frontend → http://localhost:3000
#   API docs  → http://localhost:8000/docs
#   Health    → http://localhost:8000/health
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register |
| POST | `/auth/login` | — | Login → JWT |
| GET | `/auth/me` | ✓ | Current user |
| POST | `/shorten` | optional | Create short URL |
| GET | `/{code}` | — | Redirect |
| GET | `/my-urls` | ✓ | List user's URLs |
| GET | `/my-stats` | ✓ | Click stats |
| DELETE | `/urls/{code}` | ✓ | Delete URL |
| GET | `/health` | — | Health check |

## AWS Deployment

```
Internet → Route 53 → ALB
                        ├── EC2 (FastAPI + NGINX)
                        │     ├── Supabase (PostgreSQL)
                        │     └── ElastiCache (Redis)
                        └── CloudFront → S3 (React)
```

See `DEPLOYMENT.md` for full step-by-step AWS instructions.

## GitHub Secrets Required

```
DOCKER_USERNAME   DOCKER_PASSWORD   EC2_HOST
EC2_SSH_KEY       DATABASE_URL      SECRET_KEY
API_URL
```
