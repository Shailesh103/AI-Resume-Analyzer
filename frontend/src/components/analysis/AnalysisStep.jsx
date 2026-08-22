export default function AnalysisStep({ step, status }) {
  const isActive = status === "active";
  const isDone = status === "done";

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 transition-colors duration-300 ${
        isActive
          ? "border-redline/40 bg-redline/[0.06]"
          : isDone
            ? "border-white/10 bg-white/[0.03]"
            : "border-white/5 bg-transparent"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
          isDone
            ? "border-white/20 bg-white/15"
            : isActive
              ? "border-redline"
              : "border-white/15"
        }`}
      >
        {isDone ? (
          <svg
            className="h-3 w-3 text-white animate-check-pop"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        ) : isActive ? (
          <span className="h-2 w-2 rounded-full bg-redline animate-pulse" />
        ) : (
          <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
        )}
      </span>

      <div className="min-w-0">
        <p
          className={`text-xs font-medium ${
            isActive ? "text-white" : isDone ? "text-white/70" : "text-white/35"
          }`}
        >
          {step.title}
          {isActive && (
            <span className="ml-1.5 font-normal text-redline/80">
              Analyzing…
            </span>
          )}
        </p>
        <p
          className={`mt-0.5 text-[11px] ${
            isActive ? "text-white/50" : "text-white/25"
          }`}
        >
          {step.description}
        </p>
      </div>
    </div>
  );
}
