"""
Session management — each session = a cloned repo in a sandbox container.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from schemas.sessions import CreateSessionRequest, SessionResponse
from services.orchestrator import OrchestratorService
import uuid

router = APIRouter()
orchestrator = OrchestratorService()


@router.post("", response_model=SessionResponse)
async def create_session(
    body: CreateSessionRequest,
    background_tasks: BackgroundTasks,
):
    """
    Create a new testing session:
    1. Clone repo into /sandbox/{user_id}/{session_id}
    2. Swap DB connection strings to SQLite
    3. Spin up Docker container
    4. Start Agent 1 (Destroyer) + Agent 2 (Surgeon) via background task
    """
    session_id = str(uuid.uuid4())

    # TODO: Get user_id from JWT middleware
    user_id = "demo_user"

    session = await orchestrator.create_session(
        session_id=session_id,
        user_id=user_id,
        repo_url=body.repo_url,
        focus_prompt=body.focus_prompt,
        branch_mode=body.branch_mode,
    )

    # Kick off the agent pipeline in the background
    background_tasks.add_task(
        orchestrator.run_pipeline,
        session_id=session_id,
    )

    return session


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    session = orchestrator.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return session


@router.post("/{session_id}/apply-fix")
async def apply_fix(session_id: str, background_tasks: BackgroundTasks):
    """Trigger the Reversion Protocol and push clean code to GitHub."""
    session = orchestrator.get_session(session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    background_tasks.add_task(orchestrator.apply_fix, session_id)
    return {"ok": True, "message": "Fix is being pushed..."}


@router.post("/{session_id}/revert")
async def revert_session(session_id: str):
    """Discard the fix — destroy sandbox without pushing."""
    await orchestrator.destroy_session(session_id)
    return {"ok": True}


@router.delete("/{session_id}")
async def close_session(session_id: str):
    """Close and clean up the sandbox session."""
    await orchestrator.destroy_session(session_id)
    return {"ok": True}
