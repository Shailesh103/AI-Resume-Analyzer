import json
import os
import re

from openai import OpenAI
from fastapi import HTTPException

from .prompts import ANALYSIS_SYSTEM_PROMPT, build_user_prompt
from .schemas import AnalysisResult

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(
                status_code=500,
                detail="Server misconfigured: OPENAI_API_KEY is not set.",
            )
        _client = OpenAI(api_key=api_key)
    return _client


def _strip_code_fences(text: str) -> str:
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*", "", text)
    text = re.sub(r"\s*```$", "", text)
    return text.strip()


async def analyze_resume(resume_text: str, job_description: str | None) -> AnalysisResult:
    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-5.5")

    user_prompt = build_user_prompt(resume_text, job_description)

    try:
        response = client.chat.completions.create(
            model=model,
            max_completion_tokens=4000,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Analysis service error: {e}")

    raw_text = response.choices[0].message.content or ""
    cleaned = _strip_code_fences(raw_text)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Could not parse analysis result: {e}")

    try:
        return AnalysisResult(**data)
    except Exception as e:
        raise HTTPException(
            status_code=502, detail=f"Analysis result did not match expected format: {e}"
        )