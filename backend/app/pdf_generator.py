"""
Resume PDF generation (Phase 6).

Uses ReportLab (pure Python, no system-level dependencies like GTK/Pango —
unlike WeasyPrint, `pip install reportlab` is all that's needed, which
matters a lot on Windows). It builds a real PDF document via ReportLab's
Platypus layout engine (Paragraph/Table/Spacer "flowables"), not a
screenshot — so it gets correct A4 pagination, automatic page breaks,
and clickable links for free.

The PDF's visual style is intentionally a *simplified* version of each
web template (no custom web fonts or letter-spacing — ReportLab's built-in
base-14 fonts are used so the PDF renders identically on every machine
without embedding fonts), but each template still gets a distinct look
via TEMPLATE_STYLES below.
"""
import io
from xml.sax.saxutils import escape as _esc

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

PAGE_MARGIN = 18 * mm
CONTENT_WIDTH = A4[0] - 2 * PAGE_MARGIN

SECTION_TITLES = {
    "summary": "Summary",
    "experience": "Experience",
    "education": "Education",
    "skills": "Skills",
    "projects": "Projects",
    "certifications": "Certifications",
    "achievements": "Achievements",
    "languages": "Languages",
}

# One style preset per template. Adding a 6th template later means adding
# one more entry here — no new rendering code needed.
TEMPLATE_STYLES = {
    "modern": dict(
        name_font="Helvetica-Bold", name_size=22, header_align=TA_LEFT, header_rule=False,
        title_font="Helvetica", title_size=11, title_color="#333333",
        contact_font="Helvetica", contact_size=9, contact_color="#555555",
        heading_font="Helvetica-Bold", heading_size=9.5, heading_color="#000000",
        heading_rule_weight=0.75, heading_rule_color="#000000", heading_prefix="",
        body_font="Helvetica", body_size=10, body_color="#1a1a1a",
        meta_font="Helvetica", meta_size=8.5, meta_color="#666666",
        section_titles={},
    ),
    "professional": dict(
        name_font="Times-Bold", name_size=22, header_align=TA_CENTER, header_rule=True,
        title_font="Times-Bold", title_size=11, title_color="#333333",
        contact_font="Times-Roman", contact_size=9, contact_color="#555555",
        heading_font="Times-Bold", heading_size=10, heading_color="#000000",
        heading_rule_weight=1.4, heading_rule_color="#000000", heading_prefix="",
        body_font="Times-Roman", body_size=10.5, body_color="#1a1a1a",
        meta_font="Times-Italic", meta_size=9, meta_color="#555555",
        section_titles={"experience": "Professional Experience"},
    ),
    "executive": dict(
        name_font="Times-Bold", name_size=24, header_align=TA_CENTER, header_rule=False,
        title_font="Helvetica", title_size=10, title_color="#555555",
        contact_font="Helvetica", contact_size=8.5, contact_color="#777777",
        heading_font="Helvetica-Bold", heading_size=8.5, heading_color="#444444",
        heading_rule_weight=0, heading_rule_color=None, heading_prefix="",
        body_font="Helvetica", body_size=10, body_color="#1a1a1a",
        meta_font="Helvetica", meta_size=8.5, meta_color="#777777",
        section_titles={"summary": "Executive Summary", "skills": "Core Competencies", "projects": "Selected Projects"},
    ),
    "developer": dict(
        name_font="Courier-Bold", name_size=20, header_align=TA_LEFT, header_rule=False,
        title_font="Helvetica", title_size=10.5, title_color="#333333",
        contact_font="Courier", contact_size=8.5, contact_color="#555555",
        heading_font="Helvetica-Bold", heading_size=9, heading_color="#000000",
        heading_rule_weight=0.75, heading_rule_color="#cccccc", heading_prefix="# ",
        body_font="Helvetica", body_size=10, body_color="#1a1a1a",
        meta_font="Courier", meta_size=8.5, meta_color="#666666",
        section_titles={"skills": "Technical Skills"},
    ),
    "minimal": dict(
        name_font="Helvetica", name_size=19, header_align=TA_LEFT, header_rule=False,
        title_font="Helvetica", title_size=10, title_color="#666666",
        contact_font="Helvetica", contact_size=8.5, contact_color="#888888",
        heading_font="Helvetica", heading_size=8, heading_color="#888888",
        heading_rule_weight=0, heading_rule_color=None, heading_prefix="",
        body_font="Helvetica", body_size=10, body_color="#333333",
        meta_font="Helvetica", meta_size=8.5, meta_color="#999999",
        section_titles={},
    ),
}


def _style(style, name, **overrides):
    base = dict(fontName=style["body_font"], fontSize=style["body_size"], textColor=HexColor(style["body_color"]))
    base.update(overrides)
    return ParagraphStyle(name, **base)


def _heading_flowable(style, styles, key):
    label = style["section_titles"].get(key, SECTION_TITLES[key])
    text = f'{style["heading_prefix"]}{label.upper()}'
    p = Paragraph(text, styles["heading"])
    if style["heading_rule_weight"]:
        rule = HRFlowable(
            width="100%",
            thickness=style["heading_rule_weight"],
            color=HexColor(style["heading_rule_color"]),
            spaceBefore=1,
            spaceAfter=4,
        )
        return [p, rule]
    return [p, Spacer(1, 4)]


def _two_col_row(left_para, right_text, styles):
    right_para = Paragraph(_esc(right_text or ""), styles["meta_right"])
    t = Table([[left_para, right_para]], colWidths=[CONTENT_WIDTH * 0.72, CONTENT_WIDTH * 0.28])
    t.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ]
        )
    )
    return t


def _contact_line(pi):
    parts = []
    if pi.get("email"):
        parts.append(f'<link href="mailto:{_esc(pi["email"])}"><u>{_esc(pi["email"])}</u></link>')
    if pi.get("phone"):
        parts.append(_esc(pi["phone"]))
    if pi.get("location"):
        parts.append(_esc(pi["location"]))

    link_labels = {"website": "Portfolio", "linkedin": "LinkedIn", "github": "GitHub"}
    for field, label in link_labels.items():
        value = pi.get(field)
        if value:
            href = value if value.startswith(("http://", "https://")) else f"https://{value}"
            parts.append(f'<link href="{_esc(href)}"><u>{label}</u></link>')
    return "   |   ".join(parts)


def _project_links(proj):
    """Short clickable 'Live' / 'GitHub' labels — never the raw URL, which can't
    wrap and would otherwise overflow its column."""
    links = []
    if proj.get("liveUrl"):
        href = proj["liveUrl"] if proj["liveUrl"].startswith(("http://", "https://")) else f'https://{proj["liveUrl"]}'
        links.append(f'<link href="{_esc(href)}"><u>Live</u></link>')
    if proj.get("githubUrl"):
        href = proj["githubUrl"] if proj["githubUrl"].startswith(("http://", "https://")) else f'https://{proj["githubUrl"]}'
        links.append(f'<link href="{_esc(href)}"><u>GitHub</u></link>')
    return "  ·  ".join(links)


def _add_experience(story, styles, style, items):
    for exp in items:
        date_range = " – ".join(filter(None, [exp.get("startDate"), exp.get("endDate")]))
        title_bits = _esc(exp.get("position") or "Position")
        if exp.get("company"):
            title_bits += f' — {_esc(exp["company"])}'
        story.append(_two_col_row(Paragraph(f"<b>{title_bits}</b>", styles["body"]), date_range, styles))
        if exp.get("location"):
            story.append(Paragraph(_esc(exp["location"]), styles["meta"]))
        if exp.get("description"):
            story.append(Paragraph(_esc(exp["description"]), styles["body"]))
        for bullet in exp.get("bulletPoints", []):
            if bullet:
                story.append(Paragraph(f"• {_esc(bullet)}", styles["bullet"]))
        story.append(Spacer(1, 6))


def _add_education(story, styles, style, items):
    for edu in items:
        left = _esc(edu.get("degree") or "")
        if edu.get("field"):
            left += f' in {_esc(edu["field"])}'
        if edu.get("institution"):
            left += f' — {_esc(edu["institution"])}'
        if edu.get("grade"):
            left += f' ({_esc(edu["grade"])})'
        story.append(_two_col_row(Paragraph(left, styles["body"]), edu.get("endDate"), styles))
        story.append(Spacer(1, 3))


def _add_skills(story, styles, style, items):
    for group in items:
        text = ", ".join(_esc(s) for s in group.get("skills", []) if s)
        if group.get("category"):
            text = f'<b>{_esc(group["category"])}:</b> {text}'
        if text:
            story.append(Paragraph(text, styles["body"]))
    story.append(Spacer(1, 2))


def _add_projects(story, styles, style, items):
    for proj in items:
        title = f'<b>{_esc(proj.get("name") or "")}</b>'
        links = _project_links(proj)
        if links:
            title += f'  —  {links}'
        story.append(Paragraph(title, styles["body"]))
        if proj.get("description"):
            story.append(Paragraph(_esc(proj["description"]), styles["body"]))
        for bullet in proj.get("bulletPoints", []):
            if bullet:
                story.append(Paragraph(f"• {_esc(bullet)}", styles["bullet"]))
        tech = ", ".join(_esc(t) for t in proj.get("technologies", []) if t)
        if tech:
            story.append(Paragraph(tech, styles["meta"]))
        story.append(Spacer(1, 6))


def _add_certifications(story, styles, style, items):
    for c in items:
        text = f'<b>{_esc(c.get("name") or "")}</b>'
        if c.get("issuer"):
            text += f' — {_esc(c["issuer"])}'
        if c.get("date"):
            text += f' ({_esc(c["date"])})'
        story.append(Paragraph(text, styles["body"]))
    story.append(Spacer(1, 2))


def _add_achievements(story, styles, style, items):
    for a in items:
        text = f'<b>{_esc(a.get("title") or "")}</b>'
        if a.get("description"):
            text += f' — {_esc(a["description"])}'
        story.append(Paragraph(text, styles["body"]))
    story.append(Spacer(1, 2))


def _add_languages(story, styles, style, items):
    parts = []
    for lang in items:
        if lang.get("language"):
            entry = lang["language"]
            if lang.get("proficiency"):
                entry += f' ({lang["proficiency"]})'
            parts.append(_esc(entry))
    if parts:
        story.append(Paragraph(", ".join(parts), styles["body"]))
    story.append(Spacer(1, 2))


def _add_summary(story, styles, style, summary_text):
    story.append(Paragraph(_esc(summary_text), styles["body"]))
    story.append(Spacer(1, 6))


_SECTION_BUILDERS = {
    "summary": None,  # handled specially below (plain text, not a list of items)
    "experience": _add_experience,
    "education": _add_education,
    "skills": _add_skills,
    "projects": _add_projects,
    "certifications": _add_certifications,
    "achievements": _add_achievements,
    "languages": _add_languages,
}


def build_resume_pdf(resume_data: dict, section_order: list, template: str) -> bytes:
    """Render resume_data into PDF bytes using the chosen template's style preset."""
    style = TEMPLATE_STYLES.get(template, TEMPLATE_STYLES["modern"])
    pi = resume_data.get("personalInfo", {})

    styles = {
        "name": _style(style, "Name", fontName=style["name_font"], fontSize=style["name_size"],
                        textColor=HexColor("#000000"), alignment=style["header_align"], spaceAfter=2),
        "title": _style(style, "Title", fontName=style["title_font"], fontSize=style["title_size"],
                         textColor=HexColor(style["title_color"]), alignment=style["header_align"], spaceAfter=4),
        "contact": _style(style, "Contact", fontName=style["contact_font"], fontSize=style["contact_size"],
                           textColor=HexColor(style["contact_color"]), alignment=style["header_align"], spaceAfter=10),
        "heading": _style(style, "Heading", fontName=style["heading_font"], fontSize=style["heading_size"],
                           textColor=HexColor(style["heading_color"]), spaceBefore=10, spaceAfter=2),
        "body": _style(style, "Body", leading=style["body_size"] * 1.4, spaceAfter=2),
        "meta": _style(style, "Meta", fontName=style["meta_font"], fontSize=style["meta_size"],
                        textColor=HexColor(style["meta_color"]), spaceAfter=2),
        "meta_right": _style(style, "MetaRight", fontName=style["meta_font"], fontSize=style["meta_size"],
                              textColor=HexColor(style["meta_color"]), alignment=TA_LEFT),
        "bullet": _style(style, "Bullet", leading=style["body_size"] * 1.35, leftIndent=10, spaceAfter=1),
    }

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=PAGE_MARGIN,
        rightMargin=PAGE_MARGIN,
        topMargin=PAGE_MARGIN,
        bottomMargin=PAGE_MARGIN,
        title=pi.get("fullName") or "Resume",
    )

    story = []
    story.append(Paragraph(_esc(pi.get("fullName") or "Your Name"), styles["name"]))
    if pi.get("professionalTitle"):
        story.append(Paragraph(_esc(pi["professionalTitle"]), styles["title"]))
    contact = _contact_line(pi)
    if contact:
        story.append(Paragraph(contact, styles["contact"]))
    if style["header_rule"]:
        story.append(HRFlowable(width="100%", thickness=1.4, color=HexColor("#000000"), spaceAfter=8))

    for key in section_order:
        if key == "summary":
            if not resume_data.get("summary"):
                continue
            story.extend(_heading_flowable(style, styles, "summary"))
            _add_summary(story, styles, style, resume_data["summary"])
            continue
        items = resume_data.get(key)
        builder = _SECTION_BUILDERS.get(key)
        if not items or not builder:
            continue
        story.extend(_heading_flowable(style, styles, key))
        builder(story, styles, style, items)

    for sec in resume_data.get("customSections", []):
        if not sec.get("title") and not sec.get("content"):
            continue
        title = f'{style["heading_prefix"]}{_esc(sec.get("title") or "Custom Section").upper()}'
        story.append(Paragraph(title, styles["heading"]))
        if style["heading_rule_weight"]:
            story.append(
                HRFlowable(width="100%", thickness=style["heading_rule_weight"],
                           color=HexColor(style["heading_rule_color"]), spaceAfter=4)
            )
        story.append(Paragraph(_esc(sec.get("content") or "").replace("\n", "<br/>"), styles["body"]))
        story.append(Spacer(1, 6))

    doc.build(story)
    return buffer.getvalue()
