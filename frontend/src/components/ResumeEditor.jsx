import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/** Escapes regex special characters in a literal string. */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Builds a regex that matches `original` even if whitespace differs slightly
 * from what's in the editable text (common when the source resume has missing
 * spaces from PDF extraction, and the AI's quoted "original" bullet cleans them up).
 * Every run of whitespace in `original` becomes "zero or more whitespace" in the pattern.
 */
function buildFlexibleMatcher(original) {
  const pattern = escapeRegex(original).replace(/\s+/g, '\\s*')
  try {
    return new RegExp(pattern)
  } catch {
    return null
  }
}

export default function ResumeEditor({ resumeText, weakBullets, filename, onBack }) {
  const [text, setText] = useState(resumeText || '')
  const [appliedIndices, setAppliedIndices] = useState(new Set())
  const [copiedIndices, setCopiedIndices] = useState(new Set())
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState(null)

  function applyRewrite(bullet, index) {
    // Fast path: exact match.
    if (text.includes(bullet.original)) {
      setText((prev) => prev.replace(bullet.original, bullet.rewrite))
      setAppliedIndices((prev) => new Set(prev).add(index))
      setError(null)
      return
    }

    // Fallback: whitespace-flexible match, for resumes with missing/extra spaces.
    const matcher = buildFlexibleMatcher(bullet.original)
    if (matcher && matcher.test(text)) {
      setText((prev) => prev.replace(matcher, bullet.rewrite))
      setAppliedIndices((prev) => new Set(prev).add(index))
      setError(null)
      return
    }

    setError(
      "Couldn't find that exact line below — it may read slightly differently in the raw text. Use \"Copy\" on that suggestion and paste it in manually."
    )
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

  async function handleExport() {
    setExporting(true)
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
      setExporting(false)
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
            onClick={handleExport}
            disabled={exporting || !text.trim()}
            className="mt-4 w-full bg-ink text-manuscript font-body font-medium py-3 rounded-sm
              hover:bg-redline transition-colors disabled:opacity-40 disabled:hover:bg-ink"
          >
            {exporting ? 'Building your file…' : 'Export as Word (.docx)'}
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
