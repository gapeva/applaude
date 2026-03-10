from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../config/.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    app_name: str = "Applaude API"
    debug: bool = False
    secret_key: str = "change-me-in-production"
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    # GitHub OAuth
    github_client_id: str = ""
    github_client_secret: str = ""
    github_redirect_uri: str = "http://localhost:8000/auth/github/callback"

    # Anthropic
    anthropic_api_key: str = ""

    # Paystack
    paystack_secret_key: str = ""
    paystack_public_key: str = ""

    # Database
    database_url: str = "postgresql://applaude:applaude_secret@localhost:5432/applaude_prod"
    sandbox_base_path: str = "./sandbox"

    # Docker
    docker_host: str = "unix:///var/run/docker.sock"

    # Pricing
    plan_monthly_price: int = 15
    plan_yearly_price: int = 140


@lru_cache
def get_settings() -> Settings:
    return Settings()
