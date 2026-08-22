import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Matches a leading bullet marker of *any* kind at the start of a line — a
// real "•", a hyphen, an asterisk, or the garbled/private-use glyph that
// PDF text-extraction sometimes produces where a bullet character should be
// (this happens with real resumes; some PDF generators, including earlier
// versions of this app's own, don't embed a font with a proper Unicode
// mapping for "•", so text-extraction reads back an unrecognizable
// character instead of a clean bullet).
const LEADING_MARKER_RE = /^[\s\-*•●▪\uF000-\uFFFF\uE000-\uF8FF]+/

/** Strips whatever bullet marker + leading whitespace a line starts with,
 * and collapses internal whitespace runs, so two versions of "the same"
 * line — one with a clean "• " and one with a garbled or missing marker —
 * compare equal. */
function normalizeForMatch(line) {
  return line.replace(LEADING_MARKER_RE, '').replace(/\s+/g, ' ').trim()
}

/**
 * Finds which line of `text` corresponds to `original`, matching on
 * normalized content rather than exact characters — robust to the raw
 * resume text having a different (or missing/garbled) bullet marker than
 * whatever the AI echoed back. Returns the line's index, or -1.
 *
 * Deliberately line-scoped: earlier this matched across the whole text blob
 * with a whitespace-flexible regex, and because "\s" in a JS regex matches
 * newlines too, a match could span two physical lines and silently merge
 * them into one when replaced. Matching one line at a time makes that class
 * of corruption impossible — a replacement can never eat a line break.
 */
function findMatchingLineIndex(lines, original) {
  const target = normalizeForMatch(original)
  if (!target) return -1

  const exact = lines.findIndex((line) => normalizeForMatch(line) === target)
  if (exact !== -1) return exact

  // Fall back to "line contains the target" for cases where `original` is
  // a trimmed fragment of a longer line rather than the whole line.
  return lines.findIndex((line) => normalizeForMatch(line).includes(target))
}

export default function ResumeEditor({ resumeText, weakBullets, filename, onBack }) {
  const [text, setText] = useState(resumeText || '')
  const [appliedIndices, setAppliedIndices] = useState(new Set())
  const [copiedIndices, setCopiedIndices] = useState(new Set())
  const [exportingDocx, setExportingDocx] = useState(false)
  const [exportingPdf, setExportingPdf] = useState(false)
  const [error, setError] = useState(null)

  function applyRewrite(bullet, index) {
    const lines = text.split('\n')
    const lineIndex = findMatchingLineIndex(lines, bullet.original)

    if (lineIndex === -1) {
      setError(
        "Couldn't find that exact line below — it may read slightly differently in the raw text. Use \"Copy\" on that suggestion and paste it in manually."
      )
      return
    }

    // Reuse whatever bullet marker the original line had — but only if it's
    // a *recognizable* one ("-", "*", "•"). If the line had no marker, or
    // had the kind of garbled/private-use glyph PDF extraction sometimes
    // leaves behind, default to a clean "• " instead of carrying that
    // problem forward into the exported file. Also strip any marker the
    // AI's rewrite text came with, so a rewrite that already starts with
    // "• " doesn't get glued onto the line's own marker into "- • Rewrite".
    const CLEAN_MARKERS = ['-', '*', '•', '●', '▪']
    const originalLine = lines[lineIndex]
    const markerMatch = originalLine.match(LEADING_MARKER_RE)
    const rawMarker = markerMatch ? markerMatch[0].trim() : ''
    const marker = CLEAN_MARKERS.includes(rawMarker) ? `${rawMarker} ` : '• '
    const cleanRewrite = bullet.rewrite.replace(LEADING_MARKER_RE, '')

    lines[lineIndex] = `${marker}${cleanRewrite}`
    setText(lines.join('\n'))
    setAppliedIndices((prev) => new Set(prev).add(index))
    setError(null)
  }

  async function copyRewrite(bullet, index) {
    try {
      await navigator.clipboard.writeText(bullet.rewrite)
      setCopiedIndices((prev) => new Set(prev).add(index))
      setTimeout(() => {
        setCopiedIndices((prev) => {
          const next = new Set(prev)
          next.delete(index)
          return next
        })
      }, 2000)
    } catch {
      setError('Could not copy — select and copy the text manually.')
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/export/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: text }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || 'Export failed.')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (filename?.replace(/\.[^.]+$/, '') || 'resume') + '-improved.pdf'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message || 'Something went wrong exporting the file.')
    } finally {
      setExportingPdf(false)
    }
  }

  async function handleExportDocx() {
    setExportingDocx(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/export/docx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume_text: text }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || 'Export failed.')
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = (filename?.replace(/\.[^.]+$/, '') || 'resume') + '-improved.docx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message || 'Something went wrong exporting the file.')
    } finally {
      setExportingDocx(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate">Build improved resume</p>
          <h2 className="font-display text-xl sm:text-2xl text-ink">Edit &amp; export</h2>
        </div>
        <button
          onClick={onBack}
          className="text-sm text-slate hover:text-redline underline underline-offset-4"
        >
          Back to analysis
        </button>
      </div>

      <div className="grid md:grid-cols-[minmax(0,1fr)_320px] gap-6">
        {/* Editable resume text */}
        <div>
          <label className="block text-xs uppercase tracking-widest text-slate mb-2">
            Resume text — edit freely
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={28}
            className="w-full border border-line bg-white/60 rounded-sm p-4 text-sm font-mono
              leading-relaxed focus:outline-none focus:ring-2 focus:ring-redline/40 focus:border-redline
              resize-y"
            spellCheck={false}
          />

          {error && (
            <p className="mt-3 text-sm text-redline border-l-2 border-redline pl-3">{error}</p>
          )}

          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || exportingDocx || !text.trim()}
            className="mt-4 w-full bg-ink text-manuscript font-body font-medium py-3 rounded-sm
              hover:bg-redline transition-colors disabled:opacity-40 disabled:hover:bg-ink"
          >
            {exportingPdf ? 'Building your file…' : 'Export as PDF'}
          </button>
          <button
            onClick={handleExportDocx}
            disabled={exportingPdf || exportingDocx || !text.trim()}
            className="mt-2 w-full text-sm text-slate hover:text-redline underline underline-offset-4
              disabled:opacity-40 disabled:hover:text-slate text-center py-1"
          >
            {exportingDocx ? 'Building your file…' : 'Export as Word (.docx) instead'}
          </button>
        </div>

        {/* AI rewrite suggestions to apply */}
        <div className="min-w-0">
          <label className="block text-xs uppercase tracking-widest text-slate mb-2">
            Apply red-pen rewrites
          </label>
          {(!weakBullets || weakBullets.length === 0) && (
            <p className="text-sm text-slate">
              No bullet-level suggestions from the analysis — just edit the text directly.
            </p>
          )}
          <div className="space-y-3">
            {weakBullets?.map((bullet, i) => {
              const applied = appliedIndices.has(i)
              const copied = copiedIndices.has(i)
              return (
                <div
                  key={i}
                  className={`border rounded-sm p-3 transition-colors overflow-hidden ${
                    applied ? 'border-forest/40 bg-forest/5' : 'border-line bg-white/40'
                  }`}
                >
                  <p className="text-xs text-ink/60 line-through mb-1 break-words">{bullet.original}</p>
                  <p className="text-xs text-ink font-medium mb-2 break-words">→ {bullet.rewrite}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyRewrite(bullet, i)}
                      disabled={applied}
                      className="text-xs uppercase tracking-widest px-2.5 py-1 rounded-full border
                        border-redline text-redline hover:bg-redline hover:text-manuscript
                        transition-colors disabled:opacity-40 disabled:hover:bg-transparent
                        disabled:hover:text-redline disabled:cursor-default"
                    >
                      {applied ? 'Applied ✓' : 'Insert into resume'}
                    </button>
                    <button
                      onClick={() => copyRewrite(bullet, i)}
                      className="text-xs uppercase tracking-widest px-2.5 py-1 rounded-full border
                        border-line text-slate hover:border-slate hover:text-ink transition-colors"
                    >
                      {copied ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
