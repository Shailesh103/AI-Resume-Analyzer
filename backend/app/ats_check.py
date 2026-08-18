"""
ATS Check (Phase 9) for the Resume Builder.

Deliberately rule-based, not AI-based: an ATS-compatibility check should be
fast, free, and give the exact same result for the exact same resume every
time — a good fit for deterministic checks rather than a model call.
"""

REQUIRED_SECTIONS = ["experience", "education", "skills"]


def _bullets_word_count(bullets: list) -> int:
    return sum(len((b or "").split()) for b in bullets)


def run_ats_check(resume_data: dict, section_order: list) -> dict:
    checks = []

    pi = resume_data.get("personalInfo", {})

    # 1. Contact info
    has_email = bool(pi.get("email"))
    has_reachable = bool(pi.get("phone") or pi.get("location"))
    if has_email and has_reachable:
        checks.append({"label": "Contact information", "passed": True, "detail": "Email and phone/location are present."})
    elif has_email:
        checks.append({"label": "Contact information", "passed": False, "detail": "Add a phone number or location so recruiters can reach you."})
    else:
        checks.append({"label": "Contact information", "passed": False, "detail": "Add an email address — most ATS reject resumes without one."})

    # 2. Standard section headings present and non-empty
    missing_sections = [s for s in REQUIRED_SECTIONS if not resume_data.get(s)]
    if not missing_sections:
        checks.append({"label": "Standard sections", "passed": True, "detail": "Experience, Education, and Skills are all filled in."})
    else:
        pretty = ", ".join(m.capitalize() for m in missing_sections)
        checks.append({"label": "Standard sections", "passed": False, "detail": f"Add content to: {pretty}."})

    # 3. Professional summary present
    summary = (resume_data.get("summary") or "").strip()
    if len(summary) >= 40:
        checks.append({"label": "Summary", "passed": True, "detail": "A summary is present."})
    elif summary:
        checks.append({"label": "Summary", "passed": False, "detail": "Your summary is quite short — aim for 2-3 sentences."})
    else:
        checks.append({"label": "Summary", "passed": False, "detail": "Add a short professional summary at the top."})

    # 4. Every experience entry has at least one bullet point
    experience = resume_data.get("experience", [])
    if experience:
        entries_without_bullets = [
            e for e in experience if not any((b or "").strip() for b in e.get("bulletPoints", []))
        ]
        if not entries_without_bullets:
            checks.append({"label": "Experience detail", "passed": True, "detail": "Every experience entry has bullet points."})
        else:
            checks.append({
                "label": "Experience detail",
                "passed": False,
                "detail": f"{len(entries_without_bullets)} experience entr{'y' if len(entries_without_bullets) == 1 else 'ies'} have no bullet points.",
            })
    else:
        checks.append({"label": "Experience detail", "passed": False, "detail": "Add at least one experience entry."})

    # 5. Skills section has actual skills listed
    skills = resume_data.get("skills", [])
    total_skills = sum(len([s for s in g.get("skills", []) if s]) for g in skills)
    if total_skills >= 5:
        checks.append({"label": "Skills coverage", "passed": True, "detail": f"{total_skills} skills listed."})
    elif total_skills > 0:
        checks.append({"label": "Skills coverage", "passed": False, "detail": f"Only {total_skills} skills listed — most ATS keyword-match against a longer list."})
    else:
        checks.append({"label": "Skills coverage", "passed": False, "detail": "Add skills relevant to the roles you're targeting."})

    # 6. Overall content length isn't too thin or excessively long
    word_count = (
        len(summary.split())
        + sum(_bullets_word_count(e.get("bulletPoints", [])) for e in experience)
        + sum(_bullets_word_count(p.get("bulletPoints", [])) for p in resume_data.get("projects", []))
    )
    if 60 <= word_count <= 900:
        checks.append({"label": "Content length", "passed": True, "detail": "Resume length looks reasonable."})
    elif word_count < 60:
        checks.append({"label": "Content length", "passed": False, "detail": "Resume looks thin — add more detail to your bullet points."})
    else:
        checks.append({"label": "Content length", "passed": False, "detail": "Resume looks long — consider trimming to your strongest points."})

    # 7. No unusual/empty custom sections
    empty_customs = [
        s for s in resume_data.get("customSections", []) if s.get("title") and not (s.get("content") or "").strip()
    ]
    if empty_customs:
        checks.append({
            "label": "Custom sections",
            "passed": False,
            "detail": f"{len(empty_customs)} custom section(s) have a title but no content.",
        })
    else:
        checks.append({"label": "Custom sections", "passed": True, "detail": "No empty custom sections."})

    passed_count = sum(1 for c in checks if c["passed"])
    score = round((passed_count / len(checks)) * 100)

    return {"score": score, "checks": checks}
