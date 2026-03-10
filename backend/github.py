from fastapi import APIRouter, Query
import httpx

router = APIRouter()


@router.get("/repos")
async def list_repos():
    """List user's GitHub repos — requires valid GitHub token from JWT."""
    # TODO: Extract GitHub token from JWT/session in Phase 3
    return []


@router.get("/repos/search")
async def search_repos(q: str = Query(..., min_length=1)):
    """Search user's repos by name."""
    # TODO: Search via GitHub API with user token
    return []
