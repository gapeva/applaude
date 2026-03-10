# Applaude — Autonomous Scale-Testing & AI-Healing SaaS

> AI-Powered debugging and stress-testing tool. Run tests, fix bugs, and get your software production-ready.

## Monorepo Structure

```
applaude/
├── frontend/         # React (Vite + TypeScript) — The Visual UI & Monaco IDE
├── backend/          # FastAPI (Python) — API, WebSockets, Agent orchestration
├── agents/           # AI Agent logic (Destroyer, Surgeon, Orchestrator)
├── sandbox/          # Docker-in-Docker isolated test environments
├── config/           # Shared config, env templates, Docker Compose
└── README.md
```

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, @monaco-editor/react, socket.io-client
- **Backend**: FastAPI, Python 3.11, WebSockets, SQLite (sandbox), PostgreSQL (prod)
- **Agents**: Claude Sonnet 4.6 API, Playwright, Locust
- **Infrastructure**: Docker-in-Docker (DinD), gVisor sandbox isolation
- **Payments**: Paystack ($15/mo · $140/yr)
- **Auth**: GitHub OAuth

## Quick Start

```bash
# 1. Install frontend deps
cd frontend && npm install

# 2. Install backend deps
cd ../backend && pip install -r requirements.txt

# 3. Copy env template
cp config/.env.template config/.env
# Fill in your keys

# 4. Start everything
docker-compose -f config/docker-compose.yml up
```

## Environment Variables (see config/.env.template)
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`
- `ANTHROPIC_API_KEY`
- `PAYSTACK_SECRET_KEY`
- `DOCKER_HOST`
- `DATABASE_URL` (Production PostgreSQL)
