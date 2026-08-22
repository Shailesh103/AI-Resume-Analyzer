import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ResumeScanner from "./ResumeScanner";
import AnalysisProgress, { computeStepStatuses } from "./AnalysisProgress";
import StatusMessage from "./StatusMessage";

const STEPS = [
  { title: "Reading your resume", description: "Extracting experience, education, and skills" },
  { title: "Checking ATS compatibility", description: "Evaluating structure, formatting, and readability" },
  { title: "Analyzing work experience", description: "Measuring impact, achievements, and action verbs" },
  { title: "Evaluating skills", description: "Identifying relevant technical and professional skills" },
  { title: "Detecting missing keywords", description: "Comparing your resume against industry expectations" },
  { title: "Reviewing bullet points", description: "Finding weak, vague, or low-impact statements" },
  { title: "Calculating your Redline Score", description: "Generating your personalized resume analysis" },
];

const MESSAGES = [
  "Extracting key achievements…",
  "Checking for ATS-friendly formatting…",
  "Evaluating measurable impact…",
  "Looking for missing industry keywords…",
  "Analyzing action verbs…",
  "Reviewing experience relevance…",
  "Comparing skills with job expectations…",
  "Identifying opportunities to strengthen your resume…",
  "Almost there — preparing your personalized report…",
];

// The simulated progress never actually finishes on its own — it eases
// toward this ceiling and holds, "slowing down" the closer it gets, and only
// crosses the line to 100 once the real `isDone` prop says the API actually
// responded. This is purely a visual pacer; the API call itself (started by
// the parent before this component even mounts) is the real source of truth.
const SIMULATED_CEILING = 92;

function ErrorState({ message, onRetry, onCancel }) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full border border-redline/40 bg-redline/10">
        <svg
          className="h-6 w-6 text-redline"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </span>
      <div className="max-w-sm">
        <h2 className="font-display text-xl text-white">
          Something interrupted the analysis.
        </h2>
        <p className="mt-2 text-sm text-white/50">
          {message || "We couldn't complete your resume analysis. Please try again."}
        </p>
      </div>
      <div className="flex items-center gap-5">
        <button
          onClick={onRetry}
          className="rounded-sm bg-redline px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-redline/90 active:scale-[0.98]"
        >
          Try Again
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-white/40 underline underline-offset-4 transition-colors hover:text-white/70"
        >
          Go back
        </button>
      </div>
    </div>
  );
}

/**
 * Full-screen cinematic "AI is analyzing your resume" experience.
 *
 * Props:
 * - isDone: true once the real API call has resolved successfully
 * - isError: true once the real API call has failed
 * - errorMessage: message to show in the error state
 * - onFinished: called once the success animation has played out — the
 *   parent should swap this component out for the Results page at that point
 * - onRetry: re-run the analysis (parent re-invokes the API request)
 * - onCancel: dismiss the screen without retrying (e.g. from the error state)
 *
 * Mount this fresh (e.g. with a `key` that changes per attempt) for each new
 * analysis attempt — all of its pacing state is local and resets on mount,
 * which is what makes "Try Again" restart the whole sequence cleanly.
 */
export default function AnalysisLoadingPage({
  isDone,
  isError,
  errorMessage,
  onFinished,
  onRetry,
  onCancel,
}) {
  const [progress, setProgress] = useState(5); // "start quickly at 5%"
  const [phase, setPhase] = useState("progress"); // 'progress' | 'success'
  const [msgIndex, setMsgIndex] = useState(0);

  const mode = isError ? "error" : phase;

  // Simulated progress pacer — random-ish increments that shrink as they
  // approach SIMULATED_CEILING, so it visually "slows down" near the end
  // without ever actually finishing until the real response arrives.
  useEffect(() => {
    if (isDone || isError) return;
    let cancelled = false;
    let timeoutId;

    function tick() {
      setProgress((p) => {
        if (p >= SIMULATED_CEILING) return p;
        const remaining = SIMULATED_CEILING - p;
        const step = Math.max(0.5, (remaining / 12) * (0.5 + Math.random() * 0.9));
        return Math.min(SIMULATED_CEILING, p + step);
      });
      if (!cancelled) {
        timeoutId = setTimeout(tick, 350 + Math.random() * 450);
      }
    }

    timeoutId = setTimeout(tick, 300);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [isDone, isError]);

  // Rotating status message — only while actively "progressing".
  useEffect(() => {
    if (mode !== "progress") return;
    const id = setInterval(() => {
      setMsgIndex((i) => (i + 1) % MESSAGES.length);
    }, 2600);
    return () => clearInterval(id);
  }, [mode]);

  // Real completion: finish the bar, hold a beat on the success state, then
  // hand back to the parent so it can reveal the Results page.
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;
  useEffect(() => {
    if (!isDone) return;
    setProgress(100);
    const revealSuccess = setTimeout(() => setPhase("success"), 550);
    const finish = setTimeout(() => {
      onFinishedRef.current?.();
    }, 550 + 700);
    return () => {
      clearTimeout(revealSuccess);
      clearTimeout(finish);
    };
  }, [isDone]);

  const statuses = computeStepStatuses(progress, STEPS.length);

  // Rendered via a portal straight into <body> — this component sits deep
  // inside AppShell's tree, and an ancestor (the "isolate" hero-wash
  // wrapper) establishes its own stacking context. A merely-high z-index
  // isn't enough to escape that: this element would still paint underneath
  // later DOM siblings outside that wrapper (like the Footer) despite
  // `fixed` + `z-50`. A portal sidesteps the whole problem by mounting
  // outside every ancestor's stacking context, guaranteeing it's always the
  // topmost thing on screen.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#07070b] px-4 py-10 animate-fade-up sm:py-16">
      {/* Ambient background: faint grid + soft moving glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-32 left-1/4 h-[420px] w-[420px] rounded-full bg-redline/20 blur-[120px] animate-glow-pulse" />
        <div
          className="absolute bottom-0 right-1/4 h-[380px] w-[380px] rounded-full bg-redline/10 blur-[130px] animate-glow-pulse"
          style={{ animationDelay: "1.4s" }}
        />
      </div>

      <div className="relative w-full max-w-2xl">
        {mode === "error" ? (
          <ErrorState message={errorMessage} onRetry={onRetry} onCancel={onCancel} />
        ) : (
          <div className="flex flex-col items-center gap-9 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-redline opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-redline" />
              </span>
              <span className="text-[11px] uppercase tracking-[0.2em] text-white/70">
                {mode === "success" ? "Analysis Complete" : "AI Analysis In Progress"}
              </span>
            </div>

            <ResumeScanner active={mode === "progress"} success={mode === "success"} />

            <div className="max-w-md">
              <h1 className="font-display text-2xl text-white sm:text-3xl">
                {mode === "success"
                  ? "Your Redline report is ready"
                  : "Your resume is being analyzed"}
              </h1>
              <p className="mt-3 text-sm text-white/50">
                {mode === "success"
                  ? "Your personalized Redline report is ready."
                  : "Redline AI is reviewing your experience, skills, keywords, and ATS compatibility."}
              </p>
            </div>

            {mode === "progress" && (
              <>
                <AnalysisProgress steps={STEPS} statuses={statuses} progress={progress} />
                <StatusMessage message={MESSAGES[msgIndex]} />
                <p className="text-[11px] tracking-wide text-white/30">
                  Please don't close this page
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
