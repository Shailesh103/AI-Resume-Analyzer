import ScoreStamp from './ScoreStamp'

function SectionBar({ name, score, note }) {
  const barColor = score >= 80 ? 'bg-forest' : score >= 60 ? 'bg-gold' : 'bg-redline'
  return (
    <div className="mb-4 min-w-0">
      <div className="flex justify-between items-baseline gap-2 mb-1">
        <span className="text-sm font-medium text-ink break-words">{name}</span>
        <span className="font-mono text-xs text-slate shrink-0">{score}/100</span>
      </div>
      <div className="h-1.5 bg-line/60 rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-slate mt-1 break-words">{note}</p>
    </div>
  )
}

function BulletMarkup({ bullet }) {
  return (
    <div className="border-l-2 border-redline pl-4 py-2 mb-4">
      <p className="text-sm text-ink/70 line-through decoration-redline decoration-2">
        {bullet.original}
      </p>
      <p className="text-xs text-redline mt-1 italic">✎ {bullet.issue}</p>
      <p className="text-sm text-ink mt-2 font-medium">→ {bullet.rewrite}</p>
    </div>
  )
}

function ATSEngineCard({ engine, score, issues, note }) {
  const barColor = score >= 75 ? 'bg-forest' : score >= 50 ? 'bg-gold' : 'bg-redline'
  const textColor = score >= 75 ? 'text-forest' : score >= 50 ? 'text-gold' : 'text-redline'

  return (
    <div className="min-w-0 border border-line bg-white/40 rounded-sm p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-sm font-medium text-ink break-words">{engine}</span>
        <span className={`font-mono text-sm font-semibold shrink-0 ${textColor}`}>{score}</span>
      </div>
      <div className="h-1.5 bg-line/60 rounded-full overflow-hidden mb-2">
        <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-slate mb-1.5 break-words">{note}</p>
      {issues?.length > 0 && (
        <ul className="space-y-1">
          {issues.map((issue, i) => (
            <li key={i} className="text-xs text-ink flex gap-1.5">
              <span className="text-redline shrink-0">•</span>
              <span className="min-w-0 break-words">{issue}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ResultsDashboard({ data, onReset, onBuildResume }) {
  const { analysis, filename } = data

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-slate">Editor's markup for</p>
          <h2 className="font-display text-xl sm:text-2xl text-ink break-words">{filename}</h2>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-slate hover:text-redline underline underline-offset-4 shrink-0"
        >
          Analyze another
        </button>
      </div>

      {/* Score stamps */}
      <div className="flex flex-wrap gap-4 sm:gap-8 justify-center bg-white/50 border border-line rounded-sm py-6 sm:py-8 px-3 mb-8">
        <ScoreStamp label="Overall" score={analysis.overall_score} size="lg" delayMs={0} />
        <ScoreStamp label="ATS Compatibility" score={analysis.ats_score} size="lg" delayMs={90} />
        {analysis.job_match_score !== null && analysis.job_match_score !== undefined && (
          <ScoreStamp label="Job Match" score={analysis.job_match_score} size="lg" delayMs={180} />
        )}
      </div>

      {/* Verdict */}
      <div className="border-l-4 border-ink pl-5 mb-6">
        <p className="font-display italic text-lg text-ink leading-relaxed">
          "{analysis.summary}"
        </p>
      </div>

      {onBuildResume && (
        <button
          onClick={onBuildResume}
          className="w-full mb-10 border-2 border-ink text-ink font-body font-medium py-3
            rounded-sm hover:bg-ink hover:text-manuscript transition-colors"
        >
          Build improved resume — apply rewrites &amp; export →
        </button>
      )}

      {/* Section scores */}
      <div className="mb-10">
        <h3 className="font-display text-lg text-ink mb-4 border-b border-line pb-2">
          Scorecard
        </h3>
        {analysis.section_scores.map((s, i) => (
          <SectionBar key={i} name={s.name} score={s.score} note={s.note} />
        ))}
      </div>

      {/* ATS engine breakdown — how this resume parses on each real platform */}
      {analysis.ats_engine_breakdown?.length > 0 && (
        <div className="mb-10">
          <h3 className="font-display text-lg text-ink mb-1 border-b border-line pb-2">
            ATS engine breakdown
          </h3>
          <p className="text-xs text-slate mb-4">
            How this resume is likely to parse on each platform, based on known formatting
            behavior of each system.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 min-w-0">
            {analysis.ats_engine_breakdown.map((e, i) => (
              <ATSEngineCard
                key={i}
                engine={e.engine}
                score={e.score}
                issues={e.issues}
                note={e.note}
              />
            ))}
          </div>
        </div>
      )}

      {/* Strengths / weaknesses */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="font-display text-lg text-ink mb-3 border-b border-line pb-2">
            What's working
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-sm text-ink flex gap-2">
                <span className="text-slate shrink-0">+</span>
                <span className="min-w-0 break-words">{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg text-ink mb-3 border-b border-line pb-2">
            What's not
          </h3>
          <ul className="space-y-2">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="text-sm text-ink flex gap-2">
                <span className="text-redline shrink-0">−</span>
                <span className="min-w-0 break-words">{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Missing keywords */}
      {analysis.missing_keywords?.length > 0 && (
        <div className="mb-10">
          <h3 className="font-display text-lg text-ink mb-3 border-b border-line pb-2">
            Missing keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_keywords.map((k, i) => (
              <span
                key={i}
                className="text-xs font-mono px-2.5 py-1 rounded-full border border-redline
                  text-redline"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weak bullets with rewrites */}
      {analysis.weak_bullets?.length > 0 && (
        <div className="mb-10">
          <h3 className="font-display text-lg text-ink mb-3 border-b border-line pb-2">
            Red-pen edits
          </h3>
          {analysis.weak_bullets.map((b, i) => (
            <BulletMarkup key={i} bullet={b} />
          ))}
        </div>
      )}

      {/* Formatting issues */}
      {analysis.formatting_issues?.length > 0 && (
        <div className="mb-10">
          <h3 className="font-display text-lg text-ink mb-3 border-b border-line pb-2">
            Formatting flags
          </h3>
          <ul className="space-y-2">
            {analysis.formatting_issues.map((f, i) => (
              <li key={i} className="text-sm text-ink flex gap-2">
                <span className="text-gold shrink-0">⚑</span>
                <span className="min-w-0 break-words">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
