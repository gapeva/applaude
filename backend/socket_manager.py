"""
Socket.IO server — handles real-time agent event streaming to the frontend.
Agent events (logs, file_updates, metrics) are emitted via this manager.
"""
import socketio
from typing import Any
import json
from datetime import datetime

# ─── Socket.IO Server (async mode) ───────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    logger=False,
    engineio_logger=False,
)

# ─── Active session rooms ─────────────────────────────────
# session_id -> set of socket ids
_session_rooms: dict[str, set[str]] = {}


@sio.event
async def connect(sid: str, environ: dict, auth: dict | None = None):
    """Client connects — join their session room."""
    session_id = environ.get("QUERY_STRING", "")
    # Parse session_id from query string e.g. session_id=abc123
    params = dict(p.split("=") for p in session_id.split("&") if "=" in p)
    sid_session = params.get("session_id")

    if sid_session:
        await sio.enter_room(sid, room=f"session:{sid_session}")
        _session_rooms.setdefault(sid_session, set()).add(sid)
        print(f"[WS] Client {sid} joined session:{sid_session}")


@sio.event
async def disconnect(sid: str):
    """Client disconnects — remove from rooms."""
    for session_id, sids in _session_rooms.items():
        sids.discard(sid)
    print(f"[WS] Client {sid} disconnected")


# ─── Agent Event Emitter ──────────────────────────────────

async def emit_to_session(session_id: str, event_type: str, payload: Any):
    """
    Emit an agent_event to all clients connected to a session room.
    
    Args:
        session_id: The session identifier
        event_type: One of: log | file_update | metric_update | status_change | fix_ready | error
        payload: Dict matching the corresponding payload type
    """
    event = {
        "type": event_type,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        **payload,
    }
    await sio.emit(
        "agent_event",
        event,
        room=f"session:{session_id}",
    )


async def emit_log(session_id: str, agent: str, message: str, level: str = "info"):
    await emit_to_session(session_id, "log", {
        "agent": agent,
        "payload": {"message": message, "level": level},
    })


async def emit_file_update(
    session_id: str,
    file_path: str,
    content: str,
    language: str,
    change_description: str,
):
    """
    Emit a file update so the Monaco Editor streams the live patch.
    This is the core Phase 0 'Hot Reload' feature.
    """
    await emit_to_session(session_id, "file_update", {
        "agent": "surgeon",
        "payload": {
            "file_path": file_path,
            "content": content,
            "language": language,
            "change_description": change_description,
        },
    })


async def emit_metrics(session_id: str, metrics: dict):
    await emit_to_session(session_id, "metric_update", {
        "agent": "destroyer",
        "payload": metrics,
    })


async def emit_status(session_id: str, status: str, message: str):
    await emit_to_session(session_id, "status_change", {
        "agent": "orchestrator",
        "payload": {"status": status, "message": message},
    })


async def emit_fix_ready(session_id: str, fix_payload: dict):
    await emit_to_session(session_id, "fix_ready", {
        "agent": "surgeon",
        "payload": fix_payload,
    })
