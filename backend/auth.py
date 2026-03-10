"""
GitHub OAuth flow:
1. Frontend calls GET /auth/github/url  → gets redirect URL
2. GitHub redirects to /auth/github/callback?code=xxx
3. Backend exchanges code for access token, fetches user, returns JWT
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import RedirectResponse
import httpx
from jose import jwt
from datetime import datetime, timedelta

from core.config import get_settings
from schemas.auth import CallbackRequest, AuthResponse

router = APIRouter()
settings = get_settings()

GITHUB_OAUTH_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_DAYS = 30


def create_jwt(user_id: int, login: str) -> str:
    expire = datetime.utcnow() + timedelta(days=JWT_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(user_id), "login": login, "exp": expire},
        settings.secret_key,
        algorithm=JWT_ALGORITHM,
    )


@router.get("/github/url")
async def get_github_oauth_url():
    """Return the GitHub OAuth URL for the frontend to redirect to."""
    url = (
        f"{GITHUB_OAUTH_URL}"
        f"?client_id={settings.github_client_id}"
        f"&redirect_uri={settings.github_redirect_uri}"
        f"&scope=repo,read:user,user:email"
    )
    return {"url": url}


@router.post("/github/callback")
async def github_callback(body: CallbackRequest):
    """Exchange GitHub code for user data + JWT."""
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_res = await client.post(
            GITHUB_TOKEN_URL,
            data={
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "code": body.code,
                "redirect_uri": settings.github_redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        token_data = token_res.json()
        access_token = token_data.get("access_token")

        if not access_token:
            raise HTTPException(400, "Failed to exchange GitHub code")

        # Fetch user profile
        user_res = await client.get(
            GITHUB_USER_URL,
            headers={"Authorization": f"token {access_token}", "Accept": "application/json"},
        )
        github_user = user_res.json()

    # TODO: Upsert user in PostgreSQL production DB
    # For now, return JWT directly
    jwt_token = create_jwt(github_user["id"], github_user["login"])

    return AuthResponse(
        user={
            "id": github_user["id"],
            "login": github_user["login"],
            "name": github_user.get("name") or github_user["login"],
            "avatar_url": github_user["avatar_url"],
            "email": github_user.get("email"),
            "html_url": github_user["html_url"],
        },
        token=jwt_token,
    )


@router.get("/me")
async def get_me():
    """Return current user — implemented with JWT middleware in Phase 3."""
    raise HTTPException(501, "Implement JWT middleware in Phase 3")


@router.post("/logout")
async def logout():
    return {"ok": True}
