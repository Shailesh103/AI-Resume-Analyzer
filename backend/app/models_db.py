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
    hashed_password = Column(String, nullable=False)
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
    result_json = Column(Text, nullable=False)  # full AnalysisResult stored as JSON text
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    owner = relationship("User", back_populates="analyses")


class UsageLog(Base):
    """One row per successful /analyze call — used to enforce daily rate limits.

    identifier is either a user's id (for logged-in users) or "ip:<address>"
    (for guests), so both can be counted the same way.
    """
    __tablename__ = "usage_logs"

    id = Column(String, primary_key=True, default=_uuid)
    identifier = Column(String, nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
