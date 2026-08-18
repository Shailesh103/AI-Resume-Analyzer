"""
Daily rate limiting for the /analyze endpoint.

Guests, free logged-in users, and Pro (paying) users each get a daily quota.
This protects the OpenAI API key from runaway costs if the app gets shared
widely or hit by a bot — even Pro users get a (generous) cap, not truly
unlimited, since a stuck retry loop or bug could otherwise run up a large bill.

Limits are configurable via environment variables so they can be tuned
without a code change:
  GUEST_DAILY_LIMIT   (default 3)
  USER_DAILY_LIMIT    (default 10)
  PRO_DAILY_LIMIT     (default 100)
"""
import os
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException, Request
from sqlalchemy.orm import Session

from .models_db import UsageLog

GUEST_DAILY_LIMIT = int(os.getenv("GUEST_DAILY_LIMIT", "3"))
USER_DAILY_LIMIT = int(os.getenv("USER_DAILY_LIMIT", "10"))
PRO_DAILY_LIMIT = int(os.getenv("PRO_DAILY_LIMIT", "100"))

# Resume Builder's "Improve with AI" actions (Phase 8) get their own, smaller
# daily pool — separate from the resume-scan quota above — so rewriting a
# bullet point doesn't eat into someone's daily analyze() count.
AI_USER_DAILY_LIMIT = int(os.getenv("AI_USER_DAILY_LIMIT", "5"))
AI_PRO_DAILY_LIMIT = int(os.getenv("AI_PRO_DAILY_LIMIT", "200"))


def get_client_ip(request: Request) -> str:
    """Render (and most PaaS providers) sit behind a proxy, so the real
    client IP is in X-Forwarded-For, not request.client.host."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _identifier_for(request: Request, user_id: str | None) -> str:
    if user_id:
        return f"user:{user_id}"
    return f"ip:{get_client_ip(request)}"


def _limit_for(user_id: str | None, is_pro: bool) -> int:
    if is_pro:
        return PRO_DAILY_LIMIT
    return USER_DAILY_LIMIT if user_id else GUEST_DAILY_LIMIT


def check_rate_limit(
    db: Session, request: Request, user_id: str | None, is_pro: bool = False
) -> None:
    """Raises HTTP 429 if this user/guest has hit their daily quota.
    Call this BEFORE the expensive OpenAI call, not after."""
    identifier = _identifier_for(request, user_id)
    limit = _limit_for(user_id, is_pro)

    since = datetime.now(timezone.utc) - timedelta(hours=24)
    count = (
        db.query(UsageLog)
        .filter(UsageLog.identifier == identifier, UsageLog.created_at >= since)
        .count()
    )

    if count >= limit:
        if is_pro:
            detail = f"You've reached your daily limit of {limit} analyses. Try again tomorrow."
        elif user_id:
            detail = (
                f"You've reached your daily limit of {limit} analyses. "
                "Upgrade to Pro for a higher daily limit, or try again tomorrow."
            )
        else:
            detail = (
                f"You've reached your daily limit of {limit} analyses. "
                "Sign in for a higher daily limit, or try again tomorrow."
            )
        raise HTTPException(status_code=429, detail=detail)


def log_usage(db: Session, request: Request, user_id: str | None) -> None:
    """Call this AFTER a successful analysis, so failed OpenAI calls don't
    count against the user's quota."""
    identifier = _identifier_for(request, user_id)
    db.add(UsageLog(identifier=identifier))
    db.commit()


def get_usage_status(
    db: Session, request: Request, user_id: str | None, is_pro: bool = False
) -> dict:
    """Used by a small /usage endpoint so the frontend can show 'X scans left today'."""
    identifier = _identifier_for(request, user_id)
    limit = _limit_for(user_id, is_pro)

    since = datetime.now(timezone.utc) - timedelta(hours=24)
    count = (
        db.query(UsageLog)
        .filter(UsageLog.identifier == identifier, UsageLog.created_at >= since)
        .count()
    )

    return {
        "used": count,
        "limit": limit,
        "remaining": max(0, limit - count),
    }


def check_ai_rate_limit(db: Session, request: Request, user_id: str, is_pro: bool = False) -> None:
    """Same idea as check_rate_limit, but for the AI-assist (Improve with AI) pool.
    AI-assist always requires login, so there's no guest tier here."""
    identifier = f"ai:{_identifier_for(request, user_id)}"
    limit = AI_PRO_DAILY_LIMIT if is_pro else AI_USER_DAILY_LIMIT

    since = datetime.now(timezone.utc) - timedelta(hours=24)
    count = (
        db.query(UsageLog)
        .filter(UsageLog.identifier == identifier, UsageLog.created_at >= since)
        .count()
    )
    if count >= limit:
        detail = f"You've reached your daily limit of {limit} AI suggestions. Try again tomorrow."
        if not is_pro:
            detail += " Upgrade to Pro for a higher daily limit."
        raise HTTPException(status_code=429, detail=detail)


def log_ai_usage(db: Session, request: Request, user_id: str) -> None:
    identifier = f"ai:{_identifier_for(request, user_id)}"
    db.add(UsageLog(identifier=identifier))
    db.commit()
