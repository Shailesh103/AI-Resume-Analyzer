function LegalShell({ title, updated, onBack, children }) {
  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={onBack}
        className="text-sm text-slate hover:text-redline underline underline-offset-4 mb-8"
      >
        ← Back
      </button>
      <h1 className="font-display text-3xl text-ink mb-1">{title}</h1>
      <p className="text-xs text-slate mb-10">Last updated: {updated}</p>
      <div className="space-y-6 text-sm text-ink leading-relaxed">{children}</div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="font-display text-lg text-ink mb-2 border-b border-line pb-1.5">{title}</h2>
      <div className="space-y-2 text-slate">{children}</div>
    </div>
  )
}

export function PrivacyPolicy({ onBack }) {
  return (
    <LegalShell title="Privacy Policy" updated="August 2026" onBack={onBack}>
      <p>
        This page describes, in plain language, what data Redline collects and how it's used.
        We're a small project — this isn't a substitute for legal advice, but it's an accurate
        account of what actually happens with your data in this app.
      </p>

      <Section title="What we collect">
        <p>
          <strong className="text-ink">Account info:</strong> your email address, and a hashed
          password (we never store your actual password) or a Google account link if you sign
          in with Google.
        </p>
        <p>
          <strong className="text-ink">Resume content:</strong> if you're signed in, the text
          extracted from each resume you analyze is saved to your private history, along with
          the AI's feedback. If you're using Redline as a guest (not signed in), your resume
          isn't stored anywhere after the analysis is returned to you.
        </p>
        <p>
          <strong className="text-ink">Payment info:</strong> if you upgrade to Pro, your
          payment is handled entirely by Stripe. We never see or store your card details —
          only your subscription status.
        </p>
      </Section>

      <Section title="Who else sees your data">
        <p>
          <strong className="text-ink">OpenAI</strong> processes your resume text to generate
          the analysis. Per OpenAI's API data policy, data sent through their API is not used
          to train their models.
        </p>
        <p>
          <strong className="text-ink">Stripe</strong> processes payments for the Pro plan.
        </p>
        <p>
          <strong className="text-ink">Google</strong> is used only if you choose "Sign in with
          Google" — we receive your verified email address, nothing else.
        </p>
        <p>We don't sell your data or share it with advertisers.</p>
      </Section>

      <Section title="Your control over your data">
        <p>
          You can delete any individual analysis from your History page at any time. Deleting
          your account entirely is currently a manual process — email us and we'll remove your
          data.
        </p>
      </Section>

      <Section title="Questions">
        <p>Reach out using the contact link in the footer.</p>
      </Section>
    </LegalShell>
  )
}

export function TermsOfService({ onBack }) {
  return (
    <LegalShell title="Terms of Service" updated="August 2026" onBack={onBack}>
      <p>
        These terms are written in plain language for a small, independent project. They're not
        a substitute for professional legal advice.
      </p>

      <Section title="What Redline is">
        <p>
          Redline analyzes resumes using AI and gives feedback on formatting, ATS
          compatibility, and wording. It's a tool to help you improve your resume — it doesn't
          guarantee you'll pass any specific company's ATS, get an interview, or get a job.
          Treat the feedback as one useful input, not a certainty.
        </p>
      </Section>

      <Section title="Accounts and acceptable use">
        <p>Don't use Redline to upload or analyze someone else's resume without their consent.</p>
        <p>
          Don't attempt to abuse or bypass the rate limits on the free tier — they exist to keep
          the service running for everyone.
        </p>
      </Section>

      <Section title="Pro subscription">
        <p>
          The Pro plan is billed monthly through Stripe. You can cancel anytime from the billing
          portal (linked in your account menu) — you'll keep Pro access until the end of the
          billing period you already paid for, and won't be charged again after cancelling.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          Redline is provided "as is." We do our best to keep the analysis accurate and the
          service running, but we can't guarantee it will be error-free or always available.
        </p>
      </Section>

      <Section title="Questions">
        <p>Reach out using the contact link in the footer.</p>
      </Section>
    </LegalShell>
  )
}
