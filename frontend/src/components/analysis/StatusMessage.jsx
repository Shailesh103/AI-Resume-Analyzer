// Re-keys on `message` so it remounts and replays the fade-up animation
// every time the text changes — a simple, dependency-free way to get a
// one-message-at-a-time fade/slide transition.
export default function StatusMessage({ message }) {
  return (
    <div className="h-5 overflow-hidden">
      <p key={message} className="animate-fade-up text-xs text-white/40">
        {message}
      </p>
    </div>
  );
}
