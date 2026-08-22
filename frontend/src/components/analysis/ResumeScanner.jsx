// Animated "document being scanned by AI" visual: a glass card with a few
// abstract text-line bars, a soft scanning gradient sweeping down it on
// loop, and a couple of floating glow dots around it for ambience.
export default function ResumeScanner({ active, success }) {
  return (
    <div className="relative w-52 sm:w-60">
      {/* Floating ambient dots — reuse the project's existing float keyframes */}
      <span className="absolute -top-4 -left-6 h-2 w-2 rounded-full bg-redline/70 blur-[1px] animate-float" />
      <span className="absolute top-1/3 -right-8 h-1.5 w-1.5 rounded-full bg-white/40 animate-float-delayed" />
      <span className="absolute -bottom-5 left-1/4 h-1.5 w-1.5 rounded-full bg-redline/50 animate-float-slow" />

      <div className="relative rounded-xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.65)] overflow-hidden animate-float-slow">
        {/* Abstract "document" content */}
        <div className="space-y-2.5">
          <div className="h-2.5 w-2/3 rounded bg-white/20" />
          <div className="h-1.5 w-1/2 rounded bg-white/10" />
          <div className="mt-4 space-y-1.5">
            {[92, 74, 96, 58, 82, 68, 48].map((w, i) => (
              <div
                key={i}
                className="h-1.5 rounded bg-white/10"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>

        {/* Scanning sweep */}
        {active && (
          <div className="pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-redline/25 to-transparent animate-scan-sweep" />
        )}

        {/* Success overlay */}
        {success && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#07070b]/70 backdrop-blur-sm">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-redline/20 border border-redline/40 animate-check-pop">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
