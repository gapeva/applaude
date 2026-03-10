"""
Applaude Backend — FastAPI + WebSocket + Agent Orchestration
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

from core.config import get_settings
from routers import auth, sessions, github, payments
from services.socket_manager import sio

settings = get_settings()

# ─── FastAPI App ──────────────────────────────────────────
app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    description="Autonomous Scale-Testing & AI-Healing SaaS Backend",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
app.include_router(github.router, prefix="/github", tags=["github"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])

# ─── Mount Socket.IO (WebSocket layer for agents) ─────────
socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="ws/socket.io")

# ─── Health ───────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "version": "0.1.0"}


# The ASGI app exposed to uvicorn is the socket_app
# so that WebSocket connections are handled by Socket.IO
asgi_app = socket_app
