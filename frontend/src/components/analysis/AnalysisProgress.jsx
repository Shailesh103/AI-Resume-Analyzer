import AnalysisStep from "./AnalysisStep";

// Maps a 0-100 simulated progress value onto which of the N steps is
// "active" right now, with everything before it marked "done".
export function computeStepStatuses(progress, count) {
  if (progress >= 100) return Array(count).fill("done");
  const segment = 100 / count;
  const activeIndex = Math.min(count - 1, Math.floor(progress / segment));
  return Array.from({ length: count }, (_, i) =>
    i < activeIndex ? "done" : i === activeIndex ? "active" : "pending"
  );
}

export default function AnalysisProgress({ steps, statuses, progress }) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div className="w-full">
        <div className="mb-2 flex justify-between text-[11px] text-white/40">
          <span className="uppercase tracking-widest">Analyzing</span>
          <span className="tabular-nums text-white/70">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-redline/70 to-redline shadow-[0_0_12px_2px_rgba(216,38,74,0.45)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid gap-2.5 text-left sm:grid-cols-2">
        {steps.map((step, i) => (
          <AnalysisStep key={step.title} step={step} status={statuses[i]} />
        ))}
      </div>
    </div>
  );
}
