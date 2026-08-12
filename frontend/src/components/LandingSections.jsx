import { useState } from 'react'

function StepNumber({ n }) {
  return (
    <div
      className="w-12 h-12 rounded-full border-[2.5px] border-ink flex items-center justify-center
        font-display font-semibold text-lg text-ink shrink-0 -rotate-3"
    >
      {n}
    </div>
  )
}

function HowItWorks() {
  const steps = [
    {
      title: 'Drop in your resume',
      body: 'PDF, DOCX, or TXT. Paste the job description too, if you have one — it sharpens every part of the review.',
    },
    {
      title: "We mark it up like an editor would",
      body: 'Scored against the actual known parsing behavior of Workday, Greenhouse, Lever, iCIMS, and Taleo — not one generic guess.',
    },
    {
      title: 'Fix it and export',
      body: "Apply the AI's bullet rewrites with one click, edit freely, then download a clean, ATS-safe .docx.",
    },
  ]

  return (
    <section className="max-w-4xl mx-auto py-16 border-t border-line">
      <p className="text-xs uppercase tracking-widest text-slate text-center mb-2">
        How it works
      </p>
      <h2 className="font-display text-3xl text-ink text-center mb-12">
        Three steps. No fluff.
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <StepNumber n={i + 1} />
            <h3 className="font-display text-lg text-ink mt-4 mb-2">{s.title}</h3>
            <p className="text-sm text-slate leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ title, body }) {
  return (
    <div className="border border-line bg-white/40 rounded-sm p-5 hover:border-redline/40 transition-colors">
      <div className="w-6 h-1 bg-redline mb-3" />
      <h3 className="font-display text-base text-ink mb-1.5">{title}</h3>
      <p className="text-sm text-slate leading-relaxed">{body}</p>
    </div>
  )
}

function FeatureGrid() {
  const features = [
    {
      title: 'Named ATS engine breakdown',
      body: "Not one vague score — independent parseability scores for Workday, Greenhouse, Lever, iCIMS, and Taleo.",
    },
    {
      title: 'Red-pen bullet rewrites',
      body: 'Your 3–6 weakest bullets, rewritten with a real action-verb-plus-metric structure, not generic advice.',
    },
    {
      title: 'Resume builder & export',
      body: 'Apply the rewrites, edit freely, and download a clean, single-column .docx built for ATS parsing.',
    },
    {
      title: 'Job tracker',
      body: 'A lightweight board — Saved, Applied, Interviewing, Offer, Rejected — for every role you apply to.',
    },
    {
      title: 'Private history',
      body: 'Sign in and every analysis saves to your account automatically. Visible only to you.',
    },
    {
      title: 'Free to start',
      body: 'Analyze as a guest, no account needed. Sign in for a higher daily limit and saved history.',
    },
  ]

  return (
    <section className="max-w-4xl mx-auto py-16 border-t border-line">
      <p className="text-xs uppercase tracking-widest text-slate text-center mb-2">
        What you get
      </p>
      <h2 className="font-display text-3xl text-ink text-center mb-12">
        Built for the actual application, not just a score
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>
    </section>
  )
}

function PricingTeaser({ onUpgrade }) {
  return (
    <section className="max-w-4xl mx-auto py-16 border-t border-line">
      <p className="text-xs uppercase tracking-widest text-slate text-center mb-2">
        Pricing
      </p>
      <h2 className="font-display text-3xl text-ink text-center mb-12">
        Start free. Upgrade if you need more.
      </h2>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="border border-line bg-white/40 rounded-sm p-6">
          <p className="text-xs uppercase tracking-widest text-slate mb-1">Free</p>
          <p className="font-display text-3xl text-ink mb-4">₹0</p>
          <ul className="space-y-2 text-sm text-ink">
            <li>· 3 analyses/day as a guest</li>
            <li>· 10 analyses/day signed in</li>
            <li>· Full ATS engine breakdown</li>
            <li>· Red-pen rewrites &amp; .docx export</li>
            <li>· Private history &amp; job tracker</li>
          </ul>
        </div>
        <div className="border-2 border-redline bg-redline/5 rounded-sm p-6 relative">
          <span className="absolute -top-3 left-6 bg-redline text-manuscript text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
            Pro
          </span>
          <p className="text-xs uppercase tracking-widest text-slate mb-1">Pro</p>
          <p className="font-display text-3xl text-ink mb-4">
            ₹299<span className="text-sm text-slate font-body">/month</span>
          </p>
          <ul className="space-y-2 text-sm text-ink mb-5">
            <li>· Everything in Free</li>
            <li>· 100 analyses/day</li>
            <li>· Cancel anytime</li>
          </ul>
          <button
            onClick={onUpgrade}
            className="w-full bg-ink text-manuscript font-body font-medium py-2.5 rounded-sm
              hover:bg-redline transition-colors"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </section>
  )
}

function FAQItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="border-b border-line py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left gap-4"
      >
        <span className="font-display text-base text-ink">{q}</span>
        <span className={`text-redline text-xl shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>
          +
        </span>
      </button>
      {isOpen && <p className="text-sm text-slate leading-relaxed mt-3 pr-8">{a}</p>}
    </div>
  )
}

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  const items = [
    {
      q: 'Is this actually free?',
      a: 'Yes — you can analyze a resume as a guest with no account. Sign in for a higher daily limit and to save your analysis history.',
    },
    {
      q: "What does the 'ATS engine breakdown' actually check?",
      a: "It's not a live scan through licensed Workday/Greenhouse/etc. software — nobody outside those companies has that. It's modeled on the publicly documented parsing behavior of each platform (how they handle tables, columns, headers, and formatting), the same kind of analysis career coaches use.",
    },
    {
      q: 'Do you store my resume?',
      a: "If you're signed in, each analysis — including the extracted text — saves to your private history, visible only to your account. Guest analyses aren't saved anywhere after the request completes.",
    },
    {
      q: 'What file types are supported?',
      a: 'PDF, DOCX, and TXT, up to 8MB.',
    },
    {
      q: 'Can I cancel Pro anytime?',
      a: "Yes. Manage or cancel your subscription anytime from the billing portal — there's no lock-in.",
    },
  ]

  return (
    <section className="max-w-2xl mx-auto py-16 border-t border-line">
      <p className="text-xs uppercase tracking-widest text-slate text-center mb-2">
        Questions
      </p>
      <h2 className="font-display text-3xl text-ink text-center mb-10">
        Frequently asked
      </h2>
      <div>
        {items.map((item, i) => (
          <FAQItem
            key={i}
            q={item.q}
            a={item.a}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}
      </div>
    </section>
  )
}

export default function LandingSections({ onUpgrade }) {
  return (
    <>
      <HowItWorks />
      <FeatureGrid />
      <PricingTeaser onUpgrade={onUpgrade} />
      <FAQ />
    </>
  )
}
