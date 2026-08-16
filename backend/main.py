import io
import json
import os
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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
from app.exporter import build_resume_docx
from app.billing import (
    construct_webhook_event,
    create_checkout_session,
    create_portal_session,
    handle_webhook_event,
    is_pro_user,
)
from app.google_auth import verify_google_id_token
from app.models_db import Analysis, Job, Resume, User
from app.parser import extract_text
from app.rate_limit import check_rate_limit, get_usage_status, log_usage
from app.pdf_generator import build_resume_pdf
from app.schemas import (
    AnalyzeResponse,
    BillingStatus,
    CheckoutSessionResponse,
    DEFAULT_SECTION_ORDER,
    ExportRequest,
    GoogleAuthRequest,
    HistoryDetail,
    HistoryItem,
    JobCreate,
    JobOut,
    JobUpdate,
    ResumeCreate,
    ResumeData,
    ResumeListItem,
    ResumeOut,
    ResumeUpdate,
    TokenResponse,
    UserCreate,
    UserOut,
    VALID_JOB_STATUSES,
    VALID_TEMPLATES,
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

    if user is not None and user.hashed_password is None:
        raise HTTPException(
            status_code=401,
            detail="This account uses Google sign-in. Use the 'Continue with Google' button instead.",
        )

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserOut.model_validate(user))


@app.post("/auth/google", response_model=TokenResponse)
def auth_google(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    google_data = verify_google_id_token(payload.id_token)
    email = google_data["email"].lower().strip()

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        # First time signing in with this email — create a Google-linked account.
        user = User(email=email, hashed_password=None, auth_provider="google")
        db.add(user)
        db.commit()
        db.refresh(user)
    # If a user already exists with this email (e.g. they signed up with a
    # password before), we sign them in anyway — Google has already verified
    # they own this email address, so this is safe account linking, not a security hole.

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
    request: Request,
    resume: UploadFile = File(...),
    job_description: str | None = Form(default=None),
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    user_id = current_user.id if current_user else None

    # Check the quota BEFORE spending money on the OpenAI call.
    check_rate_limit(db, request, user_id, is_pro=is_pro_user(current_user))

    file_bytes = await resume.read()

    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        raise HTTPException(
            status_code=413, detail=f"File too large ({size_mb:.1f}MB). Max is {MAX_FILE_SIZE_MB}MB."
        )

    resume_text = extract_text(resume.filename, file_bytes)
    result = await analyze_resume(resume_text, job_description)

    # Only count it against the quota once we know the analysis actually succeeded.
    log_usage(db, request, user_id)

    if current_user is not None:
        record = Analysis(
            user_id=current_user.id,
            filename=resume.filename,
            overall_score=result.overall_score,
            ats_score=result.ats_score,
            job_match_score=result.job_match_score,
            resume_text=resume_text,
            result_json=result.model_dump_json(),
        )
        db.add(record)
        db.commit()

    return AnalyzeResponse(filename=resume.filename, resume_text=resume_text, analysis=result)


@app.get("/usage")
def usage(
    request: Request,
    current_user: User | None = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """Lets the frontend show 'X scans left today' before the user even uploads."""
    user_id = current_user.id if current_user else None
    return get_usage_status(db, request, user_id, is_pro=is_pro_user(current_user))


# ---------------------------------------------------------------------------
# Export (build an improved resume from edited text, download as .docx)
# ---------------------------------------------------------------------------

@app.post("/export/docx")
def export_docx(payload: ExportRequest):
    docx_bytes = build_resume_docx(payload.resume_text)
    return StreamingResponse(
        iter([docx_bytes]),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": 'attachment; filename="resume.docx"'},
    )


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
        resume_text=record.resume_text,
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


# ---------------------------------------------------------------------------
# Job tracker (requires login — this feature is inherently persistent/per-user)
# ---------------------------------------------------------------------------

def _job_to_out(job: Job) -> JobOut:
    return JobOut(
        id=job.id,
        company=job.company,
        title=job.title,
        url=job.url,
        job_description=job.job_description,
        status=job.status,
        notes=job.notes,
        analysis_id=job.analysis_id,
        created_at=job.created_at.isoformat(),
        updated_at=job.updated_at.isoformat(),
    )


@app.post("/jobs", response_model=JobOut, status_code=201)
def create_job(
    payload: JobCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if payload.status not in VALID_JOB_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {sorted(VALID_JOB_STATUSES)}.")

    job = Job(
        user_id=current_user.id,
        company=payload.company.strip(),
        title=payload.title.strip(),
        url=payload.url,
        job_description=payload.job_description,
        status=payload.status,
        notes=payload.notes,
        analysis_id=payload.analysis_id,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return _job_to_out(job)


@app.get("/jobs", response_model=list[JobOut])
def list_jobs(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    jobs = (
        db.query(Job)
        .filter(Job.user_id == current_user.id)
        .order_by(Job.updated_at.desc())
        .all()
    )
    return [_job_to_out(j) for j in jobs]


@app.patch("/jobs/{job_id}", response_model=JobOut)
def update_job(
    job_id: str,
    payload: JobUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")

    update_data = payload.model_dump(exclude_unset=True)

    if "status" in update_data and update_data["status"] not in VALID_JOB_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {sorted(VALID_JOB_STATUSES)}.")

    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)
    return _job_to_out(job)


@app.delete("/jobs/{job_id}", status_code=204)
def delete_job(
    job_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id, Job.user_id == current_user.id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    db.delete(job)
    db.commit()


# ---------------------------------------------------------------------------
# Resume Builder (Phase 1: data model + CRUD only — templates, PDF export,
# and AI assistance are separate, later phases)
# ---------------------------------------------------------------------------

def _resume_to_out(resume: Resume) -> ResumeOut:
    return ResumeOut(
        id=resume.id,
        title=resume.title,
        template=resume.template,
        resume_data=json.loads(resume.resume_data),
        section_order=json.loads(resume.section_order),
        styling=json.loads(resume.styling),
        ats_score=resume.ats_score,
        created_at=resume.created_at.isoformat(),
        updated_at=resume.updated_at.isoformat(),
    )


@app.post("/resumes", response_model=ResumeOut, status_code=201)
def create_resume(
    payload: ResumeCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    if payload.template not in VALID_TEMPLATES:
        raise HTTPException(status_code=400, detail=f"Invalid template. Must be one of {sorted(VALID_TEMPLATES)}.")

    resume_data = payload.resume_data or ResumeData()

    resume = Resume(
        user_id=current_user.id,
        title=payload.title.strip() or "Untitled resume",
        template=payload.template,
        resume_data=resume_data.model_dump_json(),
        section_order=json.dumps(DEFAULT_SECTION_ORDER),
        styling="{}",
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return _resume_to_out(resume)


@app.get("/resumes", response_model=list[ResumeListItem])
def list_resumes(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    resumes = (
        db.query(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(Resume.updated_at.desc())
        .all()
    )
    return [
        ResumeListItem(
            id=r.id,
            title=r.title,
            template=r.template,
            ats_score=r.ats_score,
            created_at=r.created_at.isoformat(),
            updated_at=r.updated_at.isoformat(),
        )
        for r in resumes
    ]


@app.get("/resumes/{resume_id}", response_model=ResumeOut)
def get_resume(
    resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found.")
    return _resume_to_out(resume)


@app.put("/resumes/{resume_id}", response_model=ResumeOut)
def update_resume(
    resume_id: str,
    payload: ResumeUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found.")

    if payload.template is not None and payload.template not in VALID_TEMPLATES:
        raise HTTPException(status_code=400, detail=f"Invalid template. Must be one of {sorted(VALID_TEMPLATES)}.")

    if payload.title is not None:
        resume.title = payload.title.strip() or "Untitled resume"
    if payload.template is not None:
        resume.template = payload.template
    if payload.resume_data is not None:
        resume.resume_data = payload.resume_data.model_dump_json()
    if payload.section_order is not None:
        resume.section_order = json.dumps(payload.section_order)
    if payload.styling is not None:
        resume.styling = json.dumps(payload.styling)

    db.commit()
    db.refresh(resume)
    return _resume_to_out(resume)


@app.delete("/resumes/{resume_id}", status_code=204)
def delete_resume(
    resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found.")
    db.delete(resume)
    db.commit()


@app.post("/resumes/{resume_id}/duplicate", response_model=ResumeOut, status_code=201)
def duplicate_resume(
    resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    original = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if original is None:
        raise HTTPException(status_code=404, detail="Resume not found.")

    copy = Resume(
        user_id=current_user.id,
        title=f"{original.title} (copy)",
        template=original.template,
        resume_data=original.resume_data,
        section_order=original.section_order,
        styling=original.styling,
        ats_score=original.ats_score,
    )
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return _resume_to_out(copy)


@app.post("/resumes/{resume_id}/generate-pdf")
def generate_resume_pdf(
    resume_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if resume is None:
        raise HTTPException(status_code=404, detail="Resume not found.")

    pdf_bytes = build_resume_pdf(
        resume_data=json.loads(resume.resume_data),
        section_order=json.loads(resume.section_order),
        template=resume.template,
    )

    safe_title = "".join(c for c in resume.title if c.isalnum() or c in " -_").strip() or "resume"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{safe_title}.pdf"'},
    )


# ---------------------------------------------------------------------------
# Billing (Stripe)
# ---------------------------------------------------------------------------

@app.post("/billing/checkout", response_model=CheckoutSessionResponse)
def billing_checkout(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    url = create_checkout_session(db, current_user)
    return CheckoutSessionResponse(url=url)


@app.get("/billing/portal", response_model=CheckoutSessionResponse)
def billing_portal(current_user: User = Depends(get_current_user)):
    url = create_portal_session(current_user)
    return CheckoutSessionResponse(url=url)


@app.get("/billing/status", response_model=BillingStatus)
def billing_status(current_user: User = Depends(get_current_user)):
    return BillingStatus(is_pro=is_pro_user(current_user), status=current_user.subscription_status)


@app.post("/billing/webhook")
async def billing_webhook(request: Request, db: Session = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")
    event = construct_webhook_event(payload, sig_header)
    handle_webhook_event(db, event)
    return {"received": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
