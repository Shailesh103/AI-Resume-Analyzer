"""
Daily rate limiting for the /analyze endpoint.

Logged-in users and guests (identified by IP) each get a daily quota. This
protects the OpenAI API key from runaway costs if the app gets shared widely
or hit by a bot.

Limits are configurable via environment variables so they can be tuned
without a code change:
  GUEST_DAILY_LIMIT   (default 3)
  USER_DAILY_LIMIT    (default 10)
"""
import os
from datetime import datetime, timezone, timedelta

from fastapi import HTTPException, Request
from sqlalchemy.orm import Session

from .models_db import UsageLog

GUEST_DAILY_LIMIT = int(os.getenv("GUEST_DAILY_LIMIT", "3"))
USER_DAILY_LIMIT = int(os.getenv("USER_DAILY_LIMIT", "10"))


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


def _limit_for(user_id: str | None) -> int:
    return USER_DAILY_LIMIT if user_id else GUEST_DAILY_LIMIT


def check_rate_limit(db: Session, request: Request, user_id: str | None) -> None:
    """Raises HTTP 429 if this user/guest has hit their daily quota.
    Call this BEFORE the expensive OpenAI call, not after."""
    identifier = _identifier_for(request, user_id)
    limit = _limit_for(user_id)

    since = datetime.now(timezone.utc) - timedelta(hours=24)
    count = (
        db.query(UsageLog)
        .filter(UsageLog.identifier == identifier, UsageLog.created_at >= since)
        .count()
    )

    if count >= limit:
        detail = (
            f"You've reached your daily limit of {limit} analyses. "
            + ("Try again tomorrow." if user_id else "Sign in for a higher daily limit, or try again tomorrow.")
        )
        raise HTTPException(status_code=429, detail=detail)


def log_usage(db: Session, request: Request, user_id: str | None) -> None:
    """Call this AFTER a successful analysis, so failed OpenAI calls don't
    count against the user's quota."""
    identifier = _identifier_for(request, user_id)
    db.add(UsageLog(identifier=identifier))
    db.commit()


def get_usage_status(db: Session, request: Request, user_id: str | None) -> dict:
    """Used by a small /usage endpoint so the frontend can show 'X scans left today'."""
    identifier = _identifier_for(request, user_id)
    limit = _limit_for(user_id)

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
