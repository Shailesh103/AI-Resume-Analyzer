import os

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.analyzer import analyze_resume
from app.parser import extract_text
from app.schemas import AnalyzeResponse

app = FastAPI(
    title="AI Resume Analyzer API",
    description="Upload a resume, get an ATS-style score, weak-bullet rewrites, and gap analysis.",
    version="1.0.0",
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


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(
    resume: UploadFile = File(...),
    job_description: str | None = Form(default=None),
):
    file_bytes = await resume.read()

    size_mb = len(file_bytes) / (1024 * 1024)
    if size_mb > MAX_FILE_SIZE_MB:
        from fastapi import HTTPException

        raise HTTPException(
            status_code=413, detail=f"File too large ({size_mb:.1f}MB). Max is {MAX_FILE_SIZE_MB}MB."
        )

    resume_text = extract_text(resume.filename, file_bytes)
    result = await analyze_resume(resume_text, job_description)

    return AnalyzeResponse(filename=resume.filename, analysis=result)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
