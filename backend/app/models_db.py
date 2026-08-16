import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer
from sqlalchemy.orm import relationship

from .database import Base


def _uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)  # null for Google-only accounts
    auth_provider = Column(String, nullable=False, default="local")  # "local" or "google"
    stripe_customer_id = Column(String, nullable=True, index=True)
    stripe_subscription_id = Column(String, nullable=True)
    subscription_status = Column(String, nullable=True)  # active/past_due/canceled/None
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    analyses = relationship("Analysis", back_populates="owner", cascade="all, delete-orphan")


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    overall_score = Column(Integer, nullable=False)
    ats_score = Column(Integer, nullable=False)
    job_match_score = Column(Integer, nullable=True)
    resume_text = Column(Text, nullable=True)  # raw extracted text, used by the resume editor
    result_json = Column(Text, nullable=False)  # full AnalysisResult stored as JSON text
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="analyses")


class Job(Base):
    """A job the user is tracking through their application pipeline."""
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, nullable=True)
    job_description = Column(Text, nullable=True)
    status = Column(String, nullable=False, default="saved")  # saved/applied/interviewing/offer/rejected
    notes = Column(Text, nullable=True)
    analysis_id = Column(String, ForeignKey("analyses.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class UsageLog(Base):
    """One row per successful /analyze call — used to enforce daily rate limits.

    identifier is either a user's id (for logged-in users) or "ip:<address>"
    (for guests), so both can be counted the same way.
    """
    __tablename__ = "usage_logs"

    id = Column(String, primary_key=True, default=_uuid)
    identifier = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)


class Resume(Base):
    """A user-built resume (Resume Builder feature) — separate from Analysis,
    which stores an *uploaded* resume's analysis. This stores structured data
    the user builds/edits directly, so a template can render it.
    """
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False, default="Untitled resume")
    template = Column(String, nullable=False, default="modern")
    resume_data = Column(Text, nullable=False)  # ResumeData, stored as JSON text
    section_order = Column(Text, nullable=False)  # JSON list of section keys, as text
    styling = Column(Text, nullable=False, default="{}")  # JSON dict, as text
    ats_score = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
