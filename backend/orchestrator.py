"""
Agent 3: The Environment Orchestrator
- Clones repos into /sandbox/{user_id}/{session_id}
- Swaps DB connection strings to SQLite database.db
- Manages Docker-in-Docker lifecycle
- Coordinates Agent 1 (Destroyer) and Agent 2 (Surgeon)
- Runs the Pre-Push Reversion Protocol before any GitHub commit
"""
import os
import asyncio
import shutil
from datetime import datetime
from typing import Optional
import git

from core.config import get_settings
from services.socket_manager import emit_log, emit_status, emit_file_update
from schemas.sessions import SessionResponse, RepoSchema

settings = get_settings()

# In-memory session store (Phase 3: move to PostgreSQL)
_sessions: dict[str, dict] = {}


class OrchestratorService:

    async def create_session(
        self,
        session_id: str,
        user_id: str,
        repo_url: str,
        focus_prompt: str,
        branch_mode: str,
    ) -> SessionResponse:
        """Clone the repo and set up the sandbox environment."""

        sandbox_path = os.path.join(settings.sandbox_base_path, user_id, session_id)
        os.makedirs(sandbox_path, exist_ok=True)

        # Parse repo metadata from URL
        repo_name = repo_url.rstrip("/").split("/")[-1].replace(".git", "")
        repo_owner = repo_url.rstrip("/").split("/")[-2]

        now = datetime.utcnow().isoformat() + "Z"
        session = {
            "id": session_id,
            "user_id": user_id,
            "repo": {
                "id": 0,
                "name": repo_name,
                "full_name": f"{repo_owner}/{repo_name}",
                "html_url": repo_url,
                "clone_url": repo_url,
                "default_branch": "main",
                "language": None,
                "private": False,
            },
            "focus_prompt": focus_prompt,
            "status": "initializing",
            "branch_mode": branch_mode,
            "sandbox_path": sandbox_path,
            "created_at": now,
            "updated_at": now,
        }
        _sessions[session_id] = session

        await emit_status(session_id, "initializing", "Sandbox initializing...")
        return SessionResponse(**session)

    def get_session(self, session_id: str) -> Optional[SessionResponse]:
        data = _sessions.get(session_id)
        if not data:
            return None
        return SessionResponse(**data)

    async def run_pipeline(self, session_id: str):
        """
        Full agent pipeline:
        1. Clone repo
        2. Swap DB config to SQLite
        3. Mount SQLite database.db into container
        4. Run Agent 1 (Destroyer)
        5. Run Agent 2 (Surgeon)
        6. Stream results back via WebSocket
        """
        session = _sessions.get(session_id)
        if not session:
            return

        try:
            # Step 1: Clone
            await emit_status(session_id, "cloning", "Cloning repository...")
            await self._clone_repo(
                session_id,
                session["repo"]["clone_url"],
                session["sandbox_path"],
            )

            # Step 2: Swap DB config
            await emit_status(session_id, "environment_ready", "Swapping DB to SQLite...")
            await self._swap_db_to_sqlite(session_id, session["sandbox_path"])

            # Step 3: Start Destroyer
            await emit_status(session_id, "attacking", "Agent 1 (Destroyer) warming up...")
            # Import here to avoid circular imports
            from agents.destroyer import DestroyerAgent
            destroyer = DestroyerAgent(session_id, session["sandbox_path"], session["focus_prompt"])
            await destroyer.run()

            # Step 4: Start Surgeon
            await emit_status(session_id, "healing", "Agent 2 (Surgeon) analyzing failures...")
            from agents.surgeon import SurgeonAgent
            surgeon = SurgeonAgent(session_id, session["sandbox_path"], session["focus_prompt"])
            await surgeon.run()

        except Exception as e:
            await emit_log(session_id, "orchestrator", f"Pipeline error: {str(e)}", "error")
            _sessions[session_id]["status"] = "error"

    async def _clone_repo(self, session_id: str, repo_url: str, sandbox_path: str):
        """Clone the repo into the sandbox directory."""
        repo_dir = os.path.join(sandbox_path, "repo")
        if os.path.exists(repo_dir):
            shutil.rmtree(repo_dir)

        await emit_log(session_id, "orchestrator", f"Cloning {repo_url}...", "info")
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, git.Repo.clone_from, repo_url, repo_dir)
        await emit_log(session_id, "orchestrator", "✅ Repo cloned successfully", "success")

    async def _swap_db_to_sqlite(self, session_id: str, sandbox_path: str):
        """
        Agent 3's DB Setup:
        Automatically swap production DB connection strings with local SQLite database.db
        Stores the originals so the Reversion Protocol can restore them later.
        """
        repo_dir = os.path.join(sandbox_path, "repo")
        env_file = os.path.join(repo_dir, ".env")
        sqlite_db_path = os.path.join(sandbox_path, "database.db")

        # Create empty SQLite DB placeholder
        open(sqlite_db_path, "a").close()

        if os.path.exists(env_file):
            with open(env_file, "r") as f:
                original_env = f.read()

            # Save original for reversion
            with open(os.path.join(sandbox_path, ".env.original"), "w") as f:
                f.write(original_env)

            # Replace DATABASE_URL with SQLite path
            import re
            new_env = re.sub(
                r"DATABASE_URL=.*",
                f"DATABASE_URL=sqlite:///{sqlite_db_path}",
                original_env,
            )
            with open(env_file, "w") as f:
                f.write(new_env)

            await emit_log(
                session_id,
                "orchestrator",
                "🔄 DB swapped to SQLite for isolated testing",
                "warning",
            )

        # Ensure database.db is in .gitignore
        gitignore_path = os.path.join(repo_dir, ".gitignore")
        gitignore_entry = "database.db\n"
        if os.path.exists(gitignore_path):
            with open(gitignore_path, "r") as f:
                content = f.read()
            if "database.db" not in content:
                with open(gitignore_path, "a") as f:
                    f.write(f"\n# Applaude test DB\n{gitignore_entry}")
        else:
            with open(gitignore_path, "w") as f:
                f.write(f"# Applaude test DB\n{gitignore_entry}")

    async def apply_fix(self, session_id: str):
        """
        The Reversion Protocol (Phase 2):
        1. Revert SQLite connection strings back to original production strings
        2. Delete database.db
        3. Ensure database.db is in .gitignore
        4. Push ONLY the clean bug fix to GitHub
        """
        session = _sessions.get(session_id)
        if not session:
            return

        sandbox_path = session["sandbox_path"]
        repo_dir = os.path.join(sandbox_path, "repo")

        await emit_log(session_id, "orchestrator", "🔒 Running Reversion Protocol...", "warning")

        # Step 1: Restore original .env
        original_env_path = os.path.join(sandbox_path, ".env.original")
        if os.path.exists(original_env_path):
            import shutil
            shutil.copy(original_env_path, os.path.join(repo_dir, ".env"))
            await emit_log(session_id, "orchestrator", "✅ DB connection strings reverted", "success")

        # Step 2: Delete database.db from repo dir (not sandbox)
        test_db = os.path.join(repo_dir, "database.db")
        if os.path.exists(test_db):
            os.remove(test_db)

        # Step 3: Push to GitHub via Agent 2
        from agents.surgeon import SurgeonAgent
        surgeon = SurgeonAgent(session_id, sandbox_path, session["focus_prompt"])
        await surgeon.push_to_github(session["branch_mode"])

        await emit_status(session_id, "completed", "✅ Clean fix pushed to GitHub!")

    async def destroy_session(self, session_id: str):
        """Destroy sandbox — delete files, stop containers."""
        session = _sessions.get(session_id)
        if not session:
            return

        sandbox_path = session["sandbox_path"]
        if os.path.exists(sandbox_path):
            shutil.rmtree(sandbox_path, ignore_errors=True)

        _sessions.pop(session_id, None)
        await emit_log(session_id, "orchestrator", "🗑️ Sandbox destroyed", "info")
