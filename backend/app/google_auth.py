"""
Verifies a Google Identity Services ID token and extracts the user's email.

The frontend uses Google's "Sign in with Google" button (Google Identity
Services JS library), which returns a signed ID token directly to the
browser — no OAuth redirect dance needed. We just verify that token here.
"""
import os

from fastapi import HTTPException
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


def verify_google_id_token(token: str) -> dict:
    """Returns {"email": str, "name": str | None} or raises HTTPException(401)."""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Server misconfigured: GOOGLE_CLIENT_ID is not set.")

    try:
        payload = google_id_token.verify_oauth2_token(
            token, google_requests.Request(), GOOGLE_CLIENT_ID
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=f"Invalid Google sign-in: {e}")

    email = payload.get("email")
    if not email:
        raise HTTPException(status_code=401, detail="Google account has no email.")
    if not payload.get("email_verified", False):
        raise HTTPException(status_code=401, detail="Google email is not verified.")

    return {"email": email, "name": payload.get("name")}
