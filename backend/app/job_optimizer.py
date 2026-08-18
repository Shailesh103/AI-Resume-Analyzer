import json
import os
import re

from fastapi import HTTPException

from .analyzer import get_client

OPTIMIZE_SYSTEM_PROMPT = (
    "You compare a resume against a job description and report keyword overlap. "
    "Respond with ONLY a JSON object, no markdown fences, no explanation, in this exact shape:\n"
    '{"matched_keywords": ["..."], "missing_keywords": ["..."], "suggestions": ["..."]}\n\n'
    "Rules:\n"
    "- matched_keywords: important skills/technologies/qualifications mentioned in the job "
    "description that also clearly appear in the resume.\n"
    "- missing_keywords: important skills/technologies/qualifications mentioned in the job "
    "description that do NOT appear in the resume. Only list things the job description "
    "actually asks for — do not invent requirements.\n"
    "- suggestions: at most 4 short, specific, actionable notes on how the person could better "
    "align their resume to this job — phrased as suggestions to consider, never as claims "
    "about what the person has done. Never suggest inventing experience, tools, companies, or "
    "achievements the resume doesn't already support.\n"
    "- Keep each list to at most 12 items."
)


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


def _flatten_resume_text(resume_data: dict) -> str:
    """Turn the structured resume_data into a plain-text blob for the model to read —
    mirrors what's actually visible on the rendered resume."""
    pi = resume_data.get("personalInfo", {})
    parts = [pi.get("fullName", ""), pi.get("professionalTitle", ""), resume_data.get("summary", "")]

    for exp in resume_data.get("experience", []):
        parts.append(f'{exp.get("position", "")} at {exp.get("company", "")}')
        parts.append(exp.get("description", ""))
        parts.extend(exp.get("bulletPoints", []))

    for edu in resume_data.get("education", []):
        parts.append(f'{edu.get("degree", "")} {edu.get("field", "")} {edu.get("institution", "")}')

    for group in resume_data.get("skills", []):
        parts.append(f'{group.get("category", "")}: {", ".join(group.get("skills", []))}')

    for proj in resume_data.get("projects", []):
        parts.append(proj.get("name", ""))
        parts.append(proj.get("description", ""))
        parts.extend(proj.get("technologies", []))
        parts.extend(proj.get("bulletPoints", []))

    for c in resume_data.get("certifications", []):
        parts.append(f'{c.get("name", "")} {c.get("issuer", "")}')

    for a in resume_data.get("achievements", []):
        parts.append(f'{a.get("title", "")} {a.get("description", "")}')

    return "\n".join(p for p in parts if p)


def optimize_for_job(resume_data: dict, job_description: str) -> dict:
    if not job_description or not job_description.strip():
        raise HTTPException(status_code=400, detail="Job description is required.")

    resume_text = _flatten_resume_text(resume_data)
    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Add some resume content before optimizing for a job.")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    user_prompt = (
        f"RESUME:\n{resume_text.strip()}\n\n"
        f"JOB DESCRIPTION:\n{job_description.strip()}"
    )

    try:
        response = client.chat.completions.create(
            model=model,
            max_completion_tokens=800,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": OPTIMIZE_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Job-match service error: {e}")

    raw_text = response.choices[0].message.content or ""
    cleaned = _strip_code_fences(raw_text)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Could not parse job-match result: {e}")

    return {
        "matched_keywords": [str(k) for k in data.get("matched_keywords", [])][:12],
        "missing_keywords": [str(k) for k in data.get("missing_keywords", [])][:12],
        "suggestions": [str(s) for s in data.get("suggestions", [])][:4],
    }
