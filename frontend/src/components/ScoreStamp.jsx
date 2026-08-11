function colorFor(score) {
  if (score >= 80) return { ring: '#3B4B66', text: '#3B4B66' } // slate = strong
  if (score >= 60) return { ring: '#B8892B', text: '#B8892B' } // gold = okay
  return { ring: '#C81E3A', text: '#C81E3A' } // redline = weak
}

export default function ScoreStamp({ label, score, size = 'lg', delayMs = 0 }) {
  const { ring, text } = colorFor(score)
  const dims = size === 'lg' ? 'w-20 h-20 sm:w-32 sm:h-32' : 'w-16 h-16 sm:w-20 sm:h-20'
  const fontSize = size === 'lg' ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl'

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${dims} shrink-0 rounded-full border-[3px] flex items-center justify-center
          relative animate-stamp-in`}
        style={{ borderColor: ring, color: text, animationDelay: `${delayMs}ms` }}
      >
        <span className={`font-display font-semibold ${fontSize}`}>{score}</span>
      </div>
      <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs uppercase tracking-widest text-slate font-medium text-center">
        {label}
      </p>
    </div>
  )
}
