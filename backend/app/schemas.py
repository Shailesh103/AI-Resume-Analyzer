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
    resume_text: str = Field(..., description="The raw extracted resume text, so the frontend can offer editing")
    analysis: AnalysisResult


class ExportRequest(BaseModel):
    resume_text: str = Field(..., min_length=1)


# --- Auth & history schemas ---

class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class GoogleAuthRequest(BaseModel):
    id_token: str


class CheckoutSessionResponse(BaseModel):
    url: str


class BillingStatus(BaseModel):
    is_pro: bool
    status: Optional[str] = None


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
    resume_text: Optional[str] = None
    analysis: AnalysisResult


# --- Job tracker schemas ---

VALID_JOB_STATUSES = {"saved", "applied", "interviewing", "offer", "rejected"}


class JobCreate(BaseModel):
    company: str
    title: str
    url: Optional[str] = None
    job_description: Optional[str] = None
    status: str = "saved"
    notes: Optional[str] = None
    analysis_id: Optional[str] = None


class JobUpdate(BaseModel):
    company: Optional[str] = None
    title: Optional[str] = None
    url: Optional[str] = None
    job_description: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class JobOut(BaseModel):
    id: str
    company: str
    title: str
    url: Optional[str] = None
    job_description: Optional[str] = None
    status: str
    notes: Optional[str] = None
    analysis_id: Optional[str] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


# --- Resume Builder schemas ---
# This is the "DATA" half of the builder — templates (Phase 3-4) are purely
# presentational and read this same shape, so switching templates never
# changes the underlying data.

class PersonalInfo(BaseModel):
    fullName: str = ""
    professionalTitle: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    website: str = ""
    linkedin: str = ""
    github: str = ""


class ExperienceItem(BaseModel):
    company: str = ""
    position: str = ""
    location: str = ""
    startDate: str = ""
    endDate: str = ""
    currentlyWorking: bool = False
    description: str = ""
    bulletPoints: List[str] = Field(default_factory=list)


class EducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    field: str = ""
    startDate: str = ""
    endDate: str = ""
    grade: str = ""


class SkillGroup(BaseModel):
    category: str = ""
    skills: List[str] = Field(default_factory=list)


class ProjectItem(BaseModel):
    name: str = ""
    description: str = ""
    technologies: List[str] = Field(default_factory=list)
    liveUrl: str = ""
    githubUrl: str = ""
    bulletPoints: List[str] = Field(default_factory=list)


class CertificationItem(BaseModel):
    name: str = ""
    issuer: str = ""
    date: str = ""
    credentialUrl: str = ""


class AchievementItem(BaseModel):
    title: str = ""
    description: str = ""


class LanguageItem(BaseModel):
    language: str = ""
    proficiency: str = ""


class CustomSection(BaseModel):
    title: str = ""
    content: str = ""


class ResumeData(BaseModel):
    personalInfo: PersonalInfo = Field(default_factory=PersonalInfo)
    summary: str = ""
    experience: List[ExperienceItem] = Field(default_factory=list)
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[SkillGroup] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[CertificationItem] = Field(default_factory=list)
    achievements: List[AchievementItem] = Field(default_factory=list)
    languages: List[LanguageItem] = Field(default_factory=list)
    customSections: List[CustomSection] = Field(default_factory=list)


DEFAULT_SECTION_ORDER = [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "achievements",
    "languages",
]

VALID_TEMPLATES = {"modern", "professional", "executive", "developer", "minimal"}


class ResumeCreate(BaseModel):
    title: str = "Untitled resume"
    template: str = "modern"
    resume_data: Optional[ResumeData] = None


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    template: Optional[str] = None
    resume_data: Optional[ResumeData] = None
    section_order: Optional[List[str]] = None
    styling: Optional[dict] = None


class ResumeListItem(BaseModel):
    id: str
    title: str
    template: str
    ats_score: Optional[int] = None
    created_at: str
    updated_at: str

    class Config:
        from_attributes = True


class ResumeOut(BaseModel):
    id: str
    title: str
    template: str
    resume_data: ResumeData
    section_order: List[str]
    styling: dict
    ats_score: Optional[int] = None
    created_at: str
    updated_at: str


# --- AI assist (Phase 8) ---

class AIAssistRequest(BaseModel):
    action: str
    text: str
    context: Optional[str] = None


class AIAssistResponse(BaseModel):
    original: str
    suggestion: str


# --- ATS check + job optimization (Phase 9) ---

class ATSCheckItem(BaseModel):
    label: str
    passed: bool
    detail: str


class ATSCheckResponse(BaseModel):
    score: int
    checks: List[ATSCheckItem]


class OptimizeForJobRequest(BaseModel):
    job_description: str


class OptimizeForJobResponse(BaseModel):
    matched_keywords: List[str]
    missing_keywords: List[str]
    suggestions: List[str]
