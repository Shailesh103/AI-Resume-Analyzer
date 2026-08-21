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
import os
from xml.sax.saxutils import escape as _esc

from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

# ReportLab's built-in base-14 fonts (Helvetica, Times, Courier) don't carry
# a ToUnicode CMap that maps the bullet glyph (U+2022) back to a real
# character — pdfminer-based text extractors (which many real ATS parsers
# are built on) read it back as the literal glyph id "(cid:127)" instead of
# "•". Embedding a real TTF (DejaVu Sans, bundled in app/fonts/ — free,
# redistributable license) *just* for the bullet glyph fixes that: the rest
# of each line still renders in the template's normal font, only the bullet
# character itself borrows this font's proper Unicode mapping. Falls back to
# a plain hyphen if the font file is ever missing (e.g. not deployed
# alongside the code), so a bad font path degrades gracefully instead of
# crashing PDF generation.
_BULLET_FONT_NAME = "DejaVuSans"
_BULLET_FONT_PATH = os.path.join(os.path.dirname(__file__), "fonts", "DejaVuSans.ttf")
try:
    pdfmetrics.registerFont(TTFont(_BULLET_FONT_NAME, _BULLET_FONT_PATH))
    _BULLET_GLYPH = f'<font name="{_BULLET_FONT_NAME}">\u2022</font>'
except Exception:
    _BULLET_GLYPH = "-"

PAGE_MARGIN = 12 * mm
# ReportLab's SimpleDocTemplate always builds its Frame as
# Frame(leftMargin, bottomMargin, width, height) with NO padding arguments —
# see doctemplate.py's SimpleDocTemplate.build(). That means the Frame's
# built-in default padding (6pt on every side) applies no matter what
# leftPadding/rightPadding you pass to SimpleDocTemplate's constructor; those
# kwargs are silently absorbed and never read. So the real usable text width
# is the page width minus the margins AND this frame padding on both sides —
# if CONTENT_WIDTH doesn't subtract it, a full-width Table computes itself
# 2*FRAME_PADDING too wide and either overflows the right margin or (when
# centered) overflows both edges symmetrically.
FRAME_PADDING = 6
CONTENT_WIDTH = A4[0] - 2 * PAGE_MARGIN - 2 * FRAME_PADDING

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
        heading_font="Helvetica-Bold", heading_size=11, heading_color="#000000",
        heading_rule_weight=0.75, heading_rule_color="#000000", heading_prefix="",
        body_font="Helvetica", body_size=10, body_color="#1a1a1a",
        meta_font="Helvetica", meta_size=8.5, meta_color="#666666",
        section_titles={},
    ),
    "professional": dict(
        name_font="Times-Bold", name_size=22, header_align=TA_CENTER, header_rule=True,
        title_font="Times-Bold", title_size=11, title_color="#333333",
        contact_font="Times-Roman", contact_size=9, contact_color="#555555",
        heading_font="Times-Bold", heading_size=11.5, heading_color="#000000",
        heading_rule_weight=1.4, heading_rule_color="#000000", heading_prefix="",
        body_font="Times-Roman", body_size=10.5, body_color="#1a1a1a",
        meta_font="Times-Italic", meta_size=9, meta_color="#555555",
        section_titles={"experience": "Professional Experience"},
    ),
    "executive": dict(
        name_font="Times-Bold", name_size=24, header_align=TA_CENTER, header_rule=False,
        title_font="Helvetica", title_size=10, title_color="#555555",
        contact_font="Helvetica", contact_size=8.5, contact_color="#777777",
        heading_font="Helvetica-Bold", heading_size=10.5, heading_color="#444444",
        heading_rule_weight=0, heading_rule_color=None, heading_prefix="",
        body_font="Helvetica", body_size=10, body_color="#1a1a1a",
        meta_font="Helvetica", meta_size=8.5, meta_color="#777777",
        section_titles={"summary": "Executive Summary", "skills": "Core Competencies", "projects": "Selected Projects"},
    ),
    "developer": dict(
        name_font="Courier-Bold", name_size=20, header_align=TA_LEFT, header_rule=False,
        title_font="Helvetica", title_size=10.5, title_color="#333333",
        contact_font="Courier", contact_size=8.5, contact_color="#555555",
        heading_font="Helvetica-Bold", heading_size=11, heading_color="#000000",
        heading_rule_weight=0.75, heading_rule_color="#cccccc", heading_prefix="# ",
        body_font="Helvetica", body_size=10, body_color="#1a1a1a",
        meta_font="Courier", meta_size=8.5, meta_color="#666666",
        section_titles={"skills": "Technical Skills"},
    ),
    "minimal": dict(
        name_font="Helvetica", name_size=19, header_align=TA_LEFT, header_rule=False,
        title_font="Helvetica", title_size=10, title_color="#666666",
        contact_font="Helvetica", contact_size=8.5, contact_color="#888888",
        heading_font="Helvetica", heading_size=10, heading_color="#888888",
        heading_rule_weight=0, heading_rule_color=None, heading_prefix="",
        body_font="Helvetica", body_size=10, body_color="#333333",
        meta_font="Helvetica", meta_size=8.5, meta_color="#999999",
        section_titles={},
    ),
}


# ---------------------------------------------------------------------------
# Spacing scale — the single source of truth for every gap in the document.
# Every _add_* function below pulls from here instead of hardcoding its own
# spacer number, so gaps stay consistent across sections no matter how much
# or how little content a resume has.
# ---------------------------------------------------------------------------
SPACING = dict(
    after_rule=2,          # between a section's rule/underline and its first item
    after_line=1,          # between two tight lines inside one entry (bullets)
    after_entry=4,         # between multi-line entries (experience, projects)
    after_tight_entry=2,   # between one-line entries (education, certs, langs)
    after_section=3,       # after the whole section, before the next heading
)

LINK_COLOR = "#1a56db"


def _style(style, name, **overrides):
    base = dict(fontName=style["body_font"], fontSize=style["body_size"], textColor=HexColor(style["body_color"]))
    base.update(overrides)
    return ParagraphStyle(name, **base)


# ---------------------------------------------------------------------------
# Inline-markup helpers — every place that used to hand-write '<b>...</b>' or
# a raw <link> tag now goes through one of these, so if the markup ever needs
# to change (e.g. a different link color) it changes in exactly one place.
# ---------------------------------------------------------------------------
def _bold(text):
    return f"<b>{text}</b>"


def _italic(text):
    return f"<i>{text}</i>"


def _normalize_url(value):
    return value if value.startswith(("http://", "https://")) else f"https://{value}"


def _link(href, label):
    return f'<link href="{_esc(href)}"><u><font color="{LINK_COLOR}">{label}</font></u></link>'


# ---------------------------------------------------------------------------
# Reusable layout components. Every section builder below is composed out of
# these four — heading, job_header, bullet_line, skill_line/meta_line — so a
# new section type never needs to invent its own ad-hoc styling.
# ---------------------------------------------------------------------------
def _heading(style, styles, key):
    """Section heading component: label + optional rule/underline."""
    label = style["section_titles"].get(key) or SECTION_TITLES.get(key, key.upper())
    text = f'{style["heading_prefix"]}{label.upper()}'
    p = Paragraph(text, styles["heading"])
    if style["heading_rule_weight"]:
        rule = HRFlowable(
            width="100%",
            thickness=style["heading_rule_weight"],
            color=HexColor(style["heading_rule_color"]),
            spaceBefore=1,
            spaceAfter=SPACING["after_rule"],
        )
        return [p, rule]
    return [p, Spacer(1, SPACING["after_rule"])]


def _two_col_row(left_para, right_text, styles):
    """Layout primitive underneath job_header: a wide left cell + a
    right-aligned narrow cell (used for the title/date pairing)."""
    right_para = Paragraph(_esc(right_text or ""), styles["meta_right"])
    t = Table([[left_para, right_para]], colWidths=[CONTENT_WIDTH * 0.78, CONTENT_WIDTH * 0.22])
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
    # Belt-and-suspenders: Table defaults to hAlign='CENTER', so if colWidths
    # and the frame's real available width ever drift apart again (e.g. a
    # margin or font tweak), it fails safe by hugging the left margin instead
    # of silently centering and drifting off both edges.
    t.hAlign = "LEFT"
    return t


def _job_header(styles, title, org=None, location=None, date_range=None, extra=None):
    """The 'title — org, location .......... dates' row shared by experience,
    education, and anything else shaped like 'what, where, when'. Centralizing
    this means experience and education can never visually drift apart."""
    left = _bold(_esc(title or ""))
    if org:
        left += f" — {_esc(org)}"
    if location:
        left += f", {_italic(_esc(location))}"
    if extra:
        left += f" {extra}"
    return _two_col_row(Paragraph(left, styles["body"]), date_range, styles)


def _bullet_line(styles, text):
    """A single '• ...' bullet, rendered ATS-safe via _BULLET_GLYPH (see the
    font registration above) instead of a raw '•' character."""
    return Paragraph(f"{_BULLET_GLYPH} {_esc(text)}", styles["bullet"])


def _skill_line(styles, category, skills):
    """One 'Category: skill, skill, skill' line."""
    text = ", ".join(_esc(s) for s in skills if s)
    if not text:
        return None
    if category:
        text = f"{_bold(_esc(category))}: {text}"
    return Paragraph(text, styles["body"])


def _meta_line(styles, text):
    """Small gray secondary line (tech stack, sub-labels, etc.)."""
    return Paragraph(_esc(text), styles["meta"]) if text else None


def _contact_line(pi):
    parts = []
    if pi.get("email"):
        parts.append(_link(f'mailto:{pi["email"]}', _esc(pi["email"])))
    if pi.get("phone"):
        parts.append(_esc(pi["phone"]))
    if pi.get("location"):
        parts.append(_esc(pi["location"]))

    link_labels = {"website": "Portfolio", "linkedin": "LinkedIn", "github": "GitHub"}
    for field, label in link_labels.items():
        value = pi.get(field)
        if value:
            parts.append(_link(_normalize_url(value), label))
    return " | ".join(parts)


def _project_links(proj):
    """Short clickable 'Live' / 'GitHub' labels — never the raw URL, which can't
    wrap and would otherwise overflow its column."""
    links = []
    if proj.get("liveUrl"):
        links.append(_link(_normalize_url(proj["liveUrl"]), "Live"))
    if proj.get("githubUrl"):
        links.append(_link(_normalize_url(proj["githubUrl"]), "GitHub"))
    return "  ·  ".join(links)


def _add_experience(story, styles, style, items):
    for exp in items:
        entry = []
        date_range = " – ".join(filter(None, [exp.get("startDate"), exp.get("endDate")]))
        entry.append(_job_header(
            styles,
            title=exp.get("position") or "Position",
            org=exp.get("company"),
            location=exp.get("location"),
            date_range=date_range,
        ))
        if exp.get("description"):
            entry.append(Paragraph(_esc(exp["description"]), styles["body"]))
        for bullet in exp.get("bulletPoints", []):
            if bullet:
                entry.append(_bullet_line(styles, bullet))
        entry.append(Spacer(1, SPACING["after_entry"]))
        story.append(KeepTogether(entry))


def _add_education(story, styles, style, items):
    # NOTE: _job_header() does its own escaping — always pass it raw text,
    # never pre-escaped, or entities like "&" get double-escaped to "&amp;amp;".
    for edu in items:
        degree = edu.get("degree") or ""
        if edu.get("field"):
            degree = f'{degree} in {edu["field"]}' if degree else edu["field"]
        grade = f'({_esc(edu["grade"])})' if edu.get("grade") else None
        story.append(_job_header(
            styles,
            title=degree,
            org=edu.get("institution"),
            date_range=edu.get("endDate"),
            extra=grade,
        ))
        story.append(Spacer(1, SPACING["after_tight_entry"]))


def _add_skills(story, styles, style, items):
    for group in items:
        line = _skill_line(styles, group.get("category"), group.get("skills", []))
        if line:
            story.append(line)
    story.append(Spacer(1, SPACING["after_tight_entry"]))


def _add_projects(story, styles, style, items):
    for proj in items:
        entry = []
        title = _bold(_esc(proj.get("name") or ""))
        links = _project_links(proj)
        if links:
            title += f'  —  {links}'
        entry.append(Paragraph(title, styles["body"]))
        if proj.get("description"):
            entry.append(Paragraph(_esc(proj["description"]), styles["body"]))
        for bullet in proj.get("bulletPoints", []):
            if bullet:
                entry.append(_bullet_line(styles, bullet))
        tech = ", ".join(_esc(t) for t in proj.get("technologies", []) if t)
        meta = _meta_line(styles, tech)
        if meta:
            entry.append(meta)
        entry.append(Spacer(1, SPACING["after_entry"]))
        story.append(KeepTogether(entry))


def _add_certifications(story, styles, style, items):
    for c in items:
        date = f'({_esc(c["date"])})' if c.get("date") else None
        story.append(_job_header(styles, title=c.get("name"), org=c.get("issuer"), extra=date))
        story.append(Spacer(1, SPACING["after_tight_entry"]))


def _add_achievements(story, styles, style, items):
    for a in items:
        text = _bold(_esc(a.get("title") or ""))
        if a.get("description"):
            text += f' — {_esc(a["description"])}'
        story.append(Paragraph(text, styles["body"]))
        story.append(Spacer(1, SPACING["after_line"]))
    story.append(Spacer(1, SPACING["after_tight_entry"]))


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
    story.append(Spacer(1, SPACING["after_tight_entry"]))


def _add_summary(story, styles, style, summary_text):
    story.append(Paragraph(_esc(summary_text), styles["body"]))
    story.append(Spacer(1, SPACING["after_section"]))


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
                        leading=style["name_size"] * 1.15, textColor=HexColor("#000000"),
                        alignment=style["header_align"], spaceAfter=2),
        "title": _style(style, "Title", fontName=style["title_font"], fontSize=style["title_size"],
                         leading=style["title_size"] * 1.3, textColor=HexColor(style["title_color"]),
                         alignment=style["header_align"], spaceAfter=3),
        "contact": _style(style, "Contact", fontName=style["contact_font"], fontSize=style["contact_size"],
                           leading=style["contact_size"] * 1.3, textColor=HexColor(style["contact_color"]),
                           alignment=style["header_align"], spaceAfter=4),
        # spaceBefore is intentionally small (not the old 10pt): the gap
        # between one section's content and the next section's heading is
        # already produced once by SPACING["after_section"] below. Giving the
        # heading its own large spaceBefore on top of that double-counts the
        # gap — that stacking was the main source of the "too much empty
        # space between sections" complaint.
        "heading": _style(style, "Heading", fontName=style["heading_font"], fontSize=style["heading_size"],
                           leading=style["heading_size"] * 1.2, textColor=HexColor(style["heading_color"]),
                           spaceBefore=4, spaceAfter=3, keepWithNext=True),
        "body": _style(style, "Body", leading=style["body_size"] * 1.3, spaceAfter=2),
        "meta": _style(style, "Meta", fontName=style["meta_font"], fontSize=style["meta_size"],
                        leading=style["meta_size"] * 1.25, textColor=HexColor(style["meta_color"]), spaceAfter=1),
        # alignment=TA_RIGHT (not TA_LEFT) is what actually pins the date to
        # the page's right margin. The table cell's own ALIGN="RIGHT" style
        # only positions the flowable box within the cell — a Paragraph fills
        # that box edge-to-edge, so it's the paragraph's own text alignment
        # that decides where short text like "2024" sits inside it.
        "meta_right": _style(style, "MetaRight", fontName=style["meta_font"], fontSize=style["meta_size"],
                              leading=style["meta_size"] * 1.25, textColor=HexColor(style["meta_color"]), alignment=TA_RIGHT),
        "bullet": _style(style, "Bullet", leading=style["body_size"] * 1.3, leftIndent=20, firstLineIndent=-10, spaceAfter=1),
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
        story.append(HRFlowable(width="100%", thickness=1.4, color=HexColor("#000000"), spaceAfter=4))

    for key in section_order:
        if key == "summary":
            if not resume_data.get("summary"):
                continue
            story.extend(_heading(style, styles, "summary"))
            _add_summary(story, styles, style, resume_data["summary"])
            continue
        items = resume_data.get(key)
        builder = _SECTION_BUILDERS.get(key)
        if not items or not builder:
            continue
        story.extend(_heading(style, styles, key))
        builder(story, styles, style, items)

    for sec in resume_data.get("customSections", []):
        if not sec.get("title") and not sec.get("content"):
            continue
        # Routed through the same _heading()/SPACING helpers as every other
        # section, instead of hand-building the heading+rule again here —
        # otherwise custom sections drift out of sync with the spacing tuning
        # above every time it changes.
        label = sec.get("title") or "Custom Section"
        story.extend(_heading({**style, "section_titles": {"_custom": label}}, styles, "_custom"))
        story.append(Paragraph(_esc(sec.get("content") or "").replace("\n", "<br/>"), styles["body"]))
        story.append(Spacer(1, SPACING["after_section"]))

    doc.build(story)
    return buffer.getvalue()
