// Decorative "resume marked up" mockup for the hero's empty side space —
// same visual language as ScoreStamp (circular stamp) and the redline
// strikethrough theme used across the app. Purely decorative; hidden on
// small screens where there's no spare space for it.
export default function HeroVisual() {
  return (
    <div
      aria-hidden="true"
      className="relative w-full max-w-[300px] aspect-[4/5] mx-auto select-none animate-fade-up"
      style={{ animationDelay: '150ms' }}
    >
      {/* The resume card */}
      <div
        className="absolute inset-0 bg-manuscript border border-line rounded-sm p-6 flex flex-col gap-3
          shadow-[0_30px_70px_-25px_rgba(23,21,34,0.35)] animate-float-slow"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-24 bg-ink/80 rounded-sm mb-2" />
            <div className="h-2 w-16 bg-slate/40 rounded-sm" />
          </div>
          <div className="w-9 h-9 rounded-full bg-line shrink-0" />
        </div>

        <div className="h-px bg-line my-1" />

        <div className="space-y-2">
          <div className="h-2 w-full bg-slate/20 rounded-sm" />
          <div className="h-2 w-5/6 bg-slate/20 rounded-sm" />
          <div className="relative h-2 w-4/6 bg-redline/25 rounded-sm">
            <span className="absolute left-0 right-0 top-1/2 h-px bg-redline -translate-y-1/2" />
          </div>
          <div className="h-2 w-full bg-forest/25 rounded-sm" />
          <div className="h-2 w-3/5 bg-slate/20 rounded-sm" />
        </div>

        <div className="h-px bg-line my-1" />

        <div className="space-y-2">
          <div className="h-2 w-full bg-slate/20 rounded-sm" />
          <div className="h-2 w-2/3 bg-slate/20 rounded-sm" />
        </div>
      </div>

      {/* Floating ATS score stamp, top right */}
      <div className="absolute -top-5 -right-5 animate-float">
        <div
          className="w-[4.5rem] h-[4.5rem] rounded-full bg-manuscript border-[3px] border-forest
            flex items-center justify-center shadow-lg rotate-6"
        >
          <span className="font-display font-semibold text-xl text-forest">87</span>
        </div>
      </div>

      {/* Matched keyword chip, left */}
      <div className="absolute top-[26%] -left-8 animate-float-delayed">
        <div
          className="flex items-center gap-1.5 bg-manuscript border border-line rounded-full
            px-3 py-1.5 shadow-md text-[11px] font-medium text-forest whitespace-nowrap"
        >
          <span>✓</span> React matched
        </div>
      </div>

      {/* Missing keyword chip, bottom right */}
      <div className="absolute bottom-[22%] -right-7 animate-float">
        <div
          className="flex items-center gap-1.5 bg-manuscript border border-line rounded-full
            px-3 py-1.5 shadow-md text-[11px] font-medium text-redline whitespace-nowrap"
        >
          <span>✕</span> Docker missing
        </div>
      </div>

      {/* Application tag chip, bottom left */}
      <div className="absolute -bottom-4 left-3 animate-float-delayed">
        <div
          className="bg-ink text-manuscript rounded-full px-3 py-1.5 shadow-md
            text-[10px] uppercase tracking-widest whitespace-nowrap"
        >
          Applied at Google
        </div>
      </div>
    </div>
  )
}
