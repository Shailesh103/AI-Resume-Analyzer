import os

from fastapi import HTTPException

from .analyzer import get_client

AI_ASSIST_SYSTEM_PROMPT = (
    "You are a precise resume-writing assistant. You rewrite or draft short pieces of resume "
    "text on request. Rules:\n"
    "- Reply with ONLY the rewritten/generated text — no preamble, no quotes, no markdown, no "
    "explanation.\n"
    "- Never invent companies, job titles, dates, technologies, or facts that were not given "
    "to you.\n"
    "- Never invent a specific number (percentage, dollar amount, count) that wasn't given to "
    "you. If a metric would strengthen the text but none was provided, insert a clearly marked "
    "placeholder like [X%] or [X hours] instead of making one up.\n"
    "- Keep it to roughly the same length as the input, unless the requested action explicitly "
    "asks for shorter or longer text."
)

ACTION_INSTRUCTIONS = {
    "improve_bullet": (
        "Rewrite this resume bullet point to start with a strong action verb and, where "
        "plausible from the given facts, show impact.\n\nText:\n{text}"
    ),
    "make_concise": "Make this text more concise without losing its meaning.\n\nText:\n{text}",
    "make_professional": "Rewrite this text in a more polished, professional tone.\n\nText:\n{text}",
    "add_measurable_impact": (
        "Rewrite this text to highlight measurable impact. If no real number is given, use a "
        "bracketed placeholder like [X%] rather than inventing one.\n\nText:\n{text}"
    ),
    "improve_summary": (
        "Rewrite this resume professional summary to be more compelling and specific, in 2-3 "
        "sentences.\n\nText:\n{text}"
    ),
    "generate_project_description": (
        "Write a 1-2 sentence professional project description based on this info (name, tech "
        "used, notes) — do not invent technologies or claims beyond what's given.\n\nInfo:\n{text}"
    ),
}

VALID_ACTIONS = set(ACTION_INSTRUCTIONS)


def get_ai_suggestion(action: str, text: str, context: str | None = None) -> str:
    if action not in VALID_ACTIONS:
        raise HTTPException(status_code=400, detail=f"Unknown action. Must be one of {sorted(VALID_ACTIONS)}.")
    if not text or not text.strip():
        raise HTTPException(status_code=400, detail="Text is required.")

    client = get_client()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    instruction = ACTION_INSTRUCTIONS[action].format(text=text.strip())
    if context and context.strip():
        instruction += (
            f"\n\nAdditional context (role/title, for tone only — do not invent facts from "
            f"it): {context.strip()}"
        )

    try:
        response = client.chat.completions.create(
            model=model,
            max_completion_tokens=300,
            messages=[
                {"role": "system", "content": AI_ASSIST_SYSTEM_PROMPT},
                {"role": "user", "content": instruction},
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI assist service error: {e}")

    suggestion = (response.choices[0].message.content or "").strip()
    if not suggestion:
        raise HTTPException(status_code=502, detail="AI assist returned an empty response.")
    return suggestion
