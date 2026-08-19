const TEMPLATE_META = [
  { key: 'modern', label: 'Modern ATS', tagline: 'Clean & ATS-safe' },
  { key: 'professional', label: 'Professional', tagline: 'Traditional & corporate' },
  { key: 'executive', label: 'Executive', tagline: 'Premium & refined' },
  { key: 'developer', label: 'Developer', tagline: 'Technical & skills-first' },
  { key: 'minimal', label: 'Minimal', tagline: 'Clean whitespace' },
]

const PRO_ONLY_TEMPLATES = new Set(['professional', 'executive', 'developer'])

/** Small illustrative mockup per template — approximates each template's real
 * typographic personality without rendering the full (heavier) ResumeRenderer
 * at a tiny scale. */
function MiniPreview({ templateKey }) {
  switch (templateKey) {
    case 'professional':
      return (
        <div className="bg-white h-full w-full p-3 flex flex-col items-center">
          <div className="h-2 w-16 bg-ink/80 rounded-sm mb-1" />
          <div className="h-1 w-10 bg-slate/40 rounded-sm mb-2" />
          <div className="w-full h-px bg-ink/60 mb-2" />
          <div className="w-full space-y-1">
            <div className="h-1 w-full bg-slate/25 rounded-sm" />
            <div className="h-1 w-5/6 bg-slate/25 rounded-sm" />
            <div className="h-1 w-full bg-slate/25 rounded-sm" />
          </div>
        </div>
      )
    case 'executive':
      return (
        <div className="bg-white h-full w-full p-3 flex flex-col items-center pt-4">
          <div className="h-2 w-20 bg-ink/80 rounded-sm mb-1.5" />
          <div className="h-1 w-8 bg-slate/30 rounded-sm mb-2" />
          <div className="w-6 h-px bg-slate/50 mb-2" />
          <div className="w-full space-y-1.5">
            <div className="h-1 w-full bg-slate/20 rounded-sm" />
            <div className="h-1 w-4/6 bg-slate/20 rounded-sm" />
          </div>
        </div>
      )
    case 'developer':
      return (
        <div className="bg-white h-full w-full p-3 flex flex-col">
          <div className="h-2 w-16 bg-ink/80 rounded-sm mb-1 font-mono" />
          <div className="h-1 w-12 bg-slate/30 rounded-sm mb-2" />
          <div className="flex gap-1 mb-2">
            <div className="h-2 w-5 bg-forest/20 rounded-sm" />
            <div className="h-2 w-5 bg-redline/20 rounded-sm" />
            <div className="h-2 w-5 bg-gold/20 rounded-sm" />
          </div>
          <div className="space-y-1">
            <div className="h-1 w-full bg-slate/20 rounded-sm" />
            <div className="h-1 w-3/6 bg-slate/20 rounded-sm" />
          </div>
        </div>
      )
    case 'minimal':
      return (
        <div className="bg-white h-full w-full p-3 flex flex-col">
          <div className="h-1.5 w-14 bg-ink/60 rounded-sm mb-2" />
          <div className="space-y-2 mt-1">
            <div className="h-0.5 w-full bg-slate/15 rounded-sm" />
            <div className="h-0.5 w-4/6 bg-slate/15 rounded-sm" />
            <div className="h-0.5 w-full bg-slate/15 rounded-sm" />
          </div>
        </div>
      )
    default: // modern
      return (
        <div className="bg-white h-full w-full p-3 flex flex-col">
          <div className="h-2 w-16 bg-ink/80 rounded-sm mb-1" />
          <div className="h-1 w-10 bg-slate/30 rounded-sm mb-2" />
          <div className="w-full h-px bg-ink/50 mb-2" />
          <div className="space-y-1">
            <div className="h-1 w-full bg-slate/25 rounded-sm" />
            <div className="h-1 w-5/6 bg-slate/25 rounded-sm" />
            <div className="h-1 w-4/6 bg-forest/25 rounded-sm" />
          </div>
        </div>
      )
  }
}

export default function TemplateGallery({ isPro, onSelect }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {TEMPLATE_META.map((t) => {
        const locked = !isPro && PRO_ONLY_TEMPLATES.has(t.key)
        return (
          <button
            key={t.key}
            onClick={() => onSelect(t.key)}
            disabled={locked}
            className={`text-left border rounded-sm overflow-hidden transition-all group ${
              locked
                ? 'border-line opacity-60 cursor-not-allowed'
                : 'border-line hover:border-redline hover:-translate-y-1 hover:shadow-[0_16px_32px_-16px_rgba(23,21,34,0.3)]'
            }`}
          >
            <div className="aspect-[3/4] bg-line/30 p-3">
              <MiniPreview templateKey={t.key} />
            </div>
            <div className="p-3 bg-manuscript">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm text-ink">{t.label}</p>
                {locked && (
                  <span className="text-[9px] uppercase tracking-widest text-manuscript bg-gold px-1.5 py-0.5 rounded-full shrink-0">
                    Pro
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate mt-0.5">{t.tagline}</p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
