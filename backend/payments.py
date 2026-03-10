"""
Paystack payment processing.
Plans: $15/month, $140/year
"Push to GitHub" feature is locked behind active subscription.
"""
from fastapi import APIRouter, HTTPException
import requests
from core.config import get_settings

router = APIRouter()
settings = get_settings()

PAYSTACK_INIT_URL = "https://api.paystack.co/transaction/initialize"
PAYSTACK_VERIFY_URL = "https://api.paystack.co/transaction/verify"

PLAN_PRICES = {
    "monthly": settings.plan_monthly_price * 100,  # Paystack uses kobo/cents
    "yearly": settings.plan_yearly_price * 100,
}


@router.post("/initialize")
async def initialize_payment(body: dict):
    plan = body.get("plan")
    if plan not in PLAN_PRICES:
        raise HTTPException(400, f"Invalid plan: {plan}")

    # TODO: Get user email from JWT in Phase 3
    email = body.get("email", "user@example.com")

    headers = {
        "Authorization": f"Bearer {settings.paystack_secret_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "email": email,
        "amount": PLAN_PRICES[plan],
        "currency": "USD",
        "callback_url": f"{settings.frontend_url}/payment/verify",
        "metadata": {"plan": plan},
    }

    res = requests.post(PAYSTACK_INIT_URL, json=payload, headers=headers)
    data = res.json()

    if not data.get("status"):
        raise HTTPException(400, data.get("message", "Payment initialization failed"))

    return {
        "authorization_url": data["data"]["authorization_url"],
        "reference": data["data"]["reference"],
    }


@router.post("/verify")
async def verify_payment(body: dict):
    reference = body.get("reference")
    if not reference:
        raise HTTPException(400, "reference is required")

    headers = {"Authorization": f"Bearer {settings.paystack_secret_key}"}
    res = requests.get(f"{PAYSTACK_VERIFY_URL}/{reference}", headers=headers)
    data = res.json()

    if not data.get("status") or data["data"]["status"] != "success":
        raise HTTPException(400, "Payment verification failed")

    # TODO: Upsert subscription in PostgreSQL in Phase 3
    plan = data["data"]["metadata"]["plan"]
    return {"subscription": {"plan": plan, "status": "active"}}


@router.get("/subscription")
async def get_subscription():
    """Get current user's subscription — from PostgreSQL in Phase 3."""
    return None
