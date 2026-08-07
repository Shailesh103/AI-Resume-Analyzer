# Redline — AI Resume Analyzer

Upload a resume, get an ATS-compatibility score, section-by-section scorecard, red-pen
rewrites of your weakest bullet points, and a keyword-gap analysis against a target job
description — all powered by Claude.

## Stack

- **Backend**: FastAPI (Python) — PDF/DOCX parsing, Claude API call, structured JSON output
- **Frontend**: React + Vite + Tailwind — "editorial markup" design

## Quick start

### 1. Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# edit .env and add your ANTHROPIC_API_KEY (https://console.anthropic.com/)

uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. Check `http://localhost:8000/docs` for the
interactive API docs (FastAPI auto-generates this).

### 2. Frontend

```bash
cd frontend
npm install

cp .env.example .env
# defaults to http://localhost:8000, change if backend runs elsewhere

npm run dev
```

Frontend runs at `http://localhost:5173`.

### 3. Try it

Upload a PDF/DOCX/TXT resume, optionally paste a job description, hit "Analyze resume."

---

## How it works

1. **Parse**: `backend/app/parser.py` extracts raw text from PDF (pdfplumber) or DOCX
   (python-docx), including table cells (a lot of resumes use table layouts).
2. **Prompt**: `backend/app/prompts.py` has a carefully constrained system prompt that
   forces Claude to return structured JSON: overall score, ATS score, section scores,
   strengths/weaknesses, missing keywords, and specific bullet-point rewrites.
3. **Validate**: `backend/app/schemas.py` uses Pydantic to validate the LLM's JSON output
   before it ever reaches the frontend — if Claude returns malformed data, the API fails
   loudly instead of silently passing garbage to the UI.
4. **Render**: The frontend renders results as if a recruiter marked up your resume with
   a red pen — strikethroughs on weak bullets, margin notes on what's wrong, a rewrite
   underneath.

---

## Roadmap — building this to "advanced" level

This is Phase 1: a fully working, deployable core product. Here's the path to advanced,
roughly in order of what to build next:

### Phase 2 — Smarter analysis
- [ ] **Job-description-aware scoring**: already wired up (`job_match_score`), but extend
      with a dedicated `/match` endpoint that does deeper semantic comparison (embeddings)
      rather than relying purely on the LLM's single pass.
- [ ] **Resume vs. multiple JDs**: let users test one resume against several postings at once.
- [ ] **Industry-specific rubrics**: swap system prompt rubric based on detected field
      (SWE vs. sales vs. academia have very different "good resume" signals).

### Phase 3 — Persistence & accounts
- [ ] Add a database (start with SQLite via SQLAlchemy, migrate to Postgres for prod).
- [ ] Store analysis history per user — track score improvement over resume versions.
- [ ] Add auth (start simple: FastAPI + JWT, or use Clerk/Auth0 for speed).
- [ ] Diff view: compare resume v1 vs v2 and show what changed.

### Phase 4 — Polish & export
- [ ] **Export report as PDF** (use `reportlab` or `weasyprint` on the backend).
- [ ] **Inline resume preview** with the actual annotations overlaid on the document
      (not just extracted bullets) — render the PDF and draw markup on top with `pdf.js`.
- [ ] Rate limiting + caching (avoid re-analyzing identical uploads).
- [ ] Streaming response (show scorecard as it's generated instead of one big wait).

### Phase 5 — Deployment
- [ ] Dockerize both services (`Dockerfile` for backend, static build for frontend).
- [ ] Deploy backend to Render/Railway/Fly.io, frontend to Vercel/Netlify.
- [ ] Add `docker-compose.yml` for one-command local dev (backend + frontend + db).
- [ ] CI: GitHub Actions running lint + build on PR.

### Nice-to-haves for the portfolio angle
- [ ] Before/after score comparison chart (recharts) once history exists.
- [ ] Shareable read-only report link.
- [ ] Dark mode toggle (the editorial theme translates well to a "night edit" look).

---

## Project structure

```
resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── parser.py       # PDF/DOCX/TXT → raw text
│   │   ├── analyzer.py     # Claude API call + JSON parsing
│   │   ├── prompts.py      # System prompt, schema instructions
│   │   └── schemas.py      # Pydantic response models
│   ├── main.py              # FastAPI app + /analyze endpoint
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── UploadForm.jsx
│   │   │   ├── ResultsDashboard.jsx
│   │   │   └── ScoreStamp.jsx
│   │   ├── App.jsx
│   │   └── index.css
│   ├── package.json
│   └── .env.example
└── README.md
```
