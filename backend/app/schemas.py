from pydantic import BaseModel, Field
from typing import List, Optional


class BulletFeedback(BaseModel):
    original: str
    issue: str
    rewrite: str


class SectionScore(BaseModel):
    name: str  # e.g. "Impact & Metrics", "Formatting", "Keyword Match"
    score: int  # 0-100
    note: str


class ATSEngineScore(BaseModel):
    engine: str  # e.g. "Workday", "Greenhouse", "Lever", "iCIMS", "Taleo"
    score: int  # 0-100
    issues: List[str] = Field(default_factory=list)
    note: str


class AnalysisResult(BaseModel):
    overall_score: int = Field(..., description="0-100 overall resume quality score")
    ats_score: int = Field(..., description="0-100 estimated ATS parseability score")
    summary: str = Field(..., description="2-3 sentence overall verdict")

    section_scores: List[SectionScore]

    strengths: List[str]
    weaknesses: List[str]

    missing_keywords: List[str] = Field(
        default_factory=list,
        description="Important keywords/skills missing, relative to job description if provided",
    )

    weak_bullets: List[BulletFeedback] = Field(
        default_factory=list,
        description="Specific weak bullet points with a suggested rewrite",
    )

    formatting_issues: List[str] = Field(default_factory=list)

    ats_engine_breakdown: List[ATSEngineScore] = Field(
        default_factory=list,
        description="Per-ATS-platform parseability breakdown (Workday, Greenhouse, Lever, etc)",
    )

    job_match_score: Optional[int] = Field(
        None, description="0-100 match score against a provided job description"
    )


class AnalyzeResponse(BaseModel):
    filename: str
    analysis: AnalysisResult


# --- Auth & history schemas ---

class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    id: str
    email: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class HistoryItem(BaseModel):
    id: str
    filename: str
    overall_score: int
    ats_score: int
    job_match_score: Optional[int] = None
    created_at: str

    class Config:
        from_attributes = True


class HistoryDetail(BaseModel):
    id: str
    filename: str
    created_at: str
    analysis: AnalysisResult
