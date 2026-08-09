import json
import os
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.analyzer import analyze_resume
from app.auth import (
    create_access_token,
    get_current_user,
    get_optional_user,
    hash_password,
    verify_password,
)
from app.database import get_db, init_db
from app.models_db import Analysis, User
from app.parser import extract_text
from app.schemas import (
    AnalyzeResponse,
    HistoryDetail,
    HistoryItem,
    TokenResponse,
    UserCreate,
    UserOut,
)

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Upload a resume, get an ATS-style score, weak-bullet rewrites, and gap analysis.",
    version="2.0.0",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE_MB = 8


@app.on_event("startup")
def on_startup():
    # Creates tables if they don't exist. No-ops if DATABASE_URL isn't set.
    init_db()


@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

@app.post("/auth/register", response_model=TokenResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    if len(payload.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    user = User(email=payload.email.lower().strip(), hashed_password=hash_password(payload.password))
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@app.post("/auth/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses "username" as the field name — we treat it as email.
    user = db.query(User).filter(User.email == form_data.username.lower().strip()).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@app.get("/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)


# ---------------------------------------------------------------------------
# Analyze (works for guests; saves to history if logged in)
# ---------------------------------------------------------------------------

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    resume: UploadFile = File(...),
    job_description: str | None = Form(default=None),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    file_bytes = await resume.read()

    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413, detail=f"File too large ({size_mb:.1f}MB). Max is {MAX_FILE_SIZE_MB}MB."
        )

    resume_text = extract_text(resume.filename, file_bytes)
    result = await analyze_resume(resume_text, job_description)

    if current_user is not None:
        record = Analysis(
            user_id=current_user.id,
            filename=resume.filename,
            overall_score=result.overall_score,
            ats_score=result.ats_score,
            job_match_score=result.job_match_score,
            result_json=result.model_dump_json(),
        )
        db.add(record)
        db.commit()

    return AnalyzeResponse(filename=resume.filename, analysis=result)


# ---------------------------------------------------------------------------
# History (requires login)
# ---------------------------------------------------------------------------

@app.get("/history", response_model=list[HistoryItem])
def list_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    records = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return [
        HistoryItem(
            id=r.id,
            filename=r.filename,
            overall_score=r.overall_score,
            ats_score=r.ats_score,
            job_match_score=r.job_match_score,
            created_at=r.created_at.isoformat(),
        )
        for r in records
    ]


@app.get("/history/{analysis_id}", response_model=HistoryDetail)
def get_history_item(
    analysis_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    record = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    return HistoryDetail(
        id=record.id,
        filename=record.filename,
        created_at=record.created_at.isoformat(),
        analysis=json.loads(record.result_json),
    )


@app.delete("/history/{analysis_id}", status_code=204)
def delete_history_item(
    analysis_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    record = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id, Analysis.user_id == current_user.id)
        .first()
    )
    if record is None:
        raise HTTPException(status_code=404, detail="Analysis not found.")
    db.delete(record)
    db.commit()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
