import json
import os
import re

from fastapi import HTTPException

from .analyzer import get_client

EXTRACT_SYSTEM_PROMPT = (
    "You convert raw resume text into a structured JSON object. Respond with ONLY a JSON "
    "object, no markdown fences, no explanation, in exactly this shape:\n"
    "{\n"
    '  "personalInfo": {"fullName": "", "professionalTitle": "", "email": "", "phone": "", '
    '"location": "", "website": "", "linkedin": "", "github": ""},\n'
    '  "summary": "",\n'
    '  "experience": [{"company": "", "position": "", "location": "", "startDate": "", '
    '"endDate": "", "currentlyWorking": false, "description": "", "bulletPoints": [""]}],\n'
    '  "education": [{"institution": "", "degree": "", "field": "", "startDate": "", '
    '"endDate": "", "grade": ""}],\n'
    '  "skills": [{"category": "", "skills": [""]}],\n'
    '  "projects": [{"name": "", "description": "", "technologies": [""], "liveUrl": "", '
    '"githubUrl": "", "bulletPoints": [""]}],\n'
    '  "certifications": [{"name": "", "issuer": "", "date": "", "credentialUrl": ""}],\n'
    '  "achievements": [{"title": "", "description": ""}],\n'
    '  "languages": [{"language": "", "proficiency": ""}]\n'
    "}\n\n"
    "Rules:\n"
    "- Only extract information that is actually present in the text. Never invent a company, "
    "date, number, skill, or achievement that isn't there.\n"
    "- Leave a field as an empty string, empty list, or false if the source text doesn't "
    "contain that information — do not guess or pad it out.\n"
    "- Split bullet/description lines from the original resume into bulletPoints as separate "
    "strings, kept close to the original wording (light cleanup of stray characters is fine).\n"
    "- dates: keep the format used in the source text (e.g. \"Jan 2023\", \"2023\").\n"
    "- currentlyWorking: true only if the text says something like \"Present\" or \"Current\" "
    "for that role's end date."
)


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def extract_resume_data(resume_text: str) -> dict:
    if not resume_text or not resume_text.strip():
        raise HTTPException(status_code=400, detail="No resume text to import from.")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    try:
        response = client.chat.completions.create(
            model=model,
            max_completion_tokens=2000,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": EXTRACT_SYSTEM_PROMPT},
                {"role": "user", "content": resume_text.strip()[:12000]},
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Resume import service error: {e}")

    raw_text = response.choices[0].message.content or ""
    cleaned = _strip_code_fences(raw_text)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Could not parse the extracted resume: {e}")

    return data
