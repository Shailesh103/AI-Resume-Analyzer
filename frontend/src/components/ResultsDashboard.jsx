import ScoreStamp from './ScoreStamp'

function SectionBar({ name, score, note }) {
  const barColor = score >= 80 ? 'bg-slate' : score >= 60 ? 'bg-gold' : 'bg-redline'
  return (
    <div className="mb-4">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm font-medium text-ink">{name}</span>
        <span className="font-mono text-xs text-slate">{score}/100</span>
      </div>
      <div className="h-1.5 bg-line/60 rounded-full overflow-hidden">
        <div className={`h-full ${barColor}`} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-slate mt-1">{note}</p>
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

export default function ResultsDashboard({ data, onReset }) {
  const { analysis, filename } = data

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate">Editor's markup for</p>
          <h2 className="font-display text-2xl text-ink">{filename}</h2>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-slate hover:text-redline underline underline-offset-4"
        >
          Analyze another
        </button>
      </div>

      {/* Score stamps */}
      <div className="flex flex-wrap gap-8 justify-center bg-white/50 border border-line rounded-sm py-8 mb-8">
        <ScoreStamp label="Overall" score={analysis.overall_score} size="lg" />
        <ScoreStamp label="ATS Compatibility" score={analysis.ats_score} size="lg" />
        {analysis.job_match_score !== null && analysis.job_match_score !== undefined && (
          <ScoreStamp label="Job Match" score={analysis.job_match_score} size="lg" />
        )}
      </div>

      {/* Verdict */}
      <div className="border-l-4 border-ink pl-5 mb-10">
        <p className="font-display italic text-lg text-ink leading-relaxed">
          "{analysis.summary}"
        </p>
      </div>

      {/* Section scores */}
      <div className="mb-10">
        <h3 className="font-display text-lg text-ink mb-4 border-b border-line pb-2">
          Scorecard
        </h3>
        {analysis.section_scores.map((s, i) => (
          <SectionBar key={i} name={s.name} score={s.score} note={s.note} />
        ))}
      </div>

      {/* Strengths / weaknesses */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div>
          <h3 className="font-display text-lg text-ink mb-3 border-b border-line pb-2">
            What's working
          </h3>
          <ul className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-sm text-ink flex gap-2">
                <span className="text-slate">+</span>
                <span>{s}</span>
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
                <span className="text-redline">−</span>
                <span>{w}</span>
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
                <span className="text-gold">⚑</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
