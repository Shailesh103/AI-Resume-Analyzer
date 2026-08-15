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

function SectionGlow({ colors }) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <div className={`absolute -top-24 left-[8%] w-[420px] h-[420px] rounded-full ${colors[0]} blur-[100px]`} />
      <div className={`absolute -bottom-24 right-[8%] w-[420px] h-[420px] rounded-full ${colors[1]} blur-[100px]`} />
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
    <section id="how-it-works" className="relative isolate overflow-hidden border-t border-line scroll-mt-24">
      <SectionGlow colors={['bg-redline/25', 'bg-forest/25']} />
      <div className="max-w-4xl mx-auto py-16">
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
      </div>
    </section>
  )
}

const ACCENTS = [
  { bar: 'bg-redline', hoverBorder: 'hover:border-redline/40' },
  { bar: 'bg-forest', hoverBorder: 'hover:border-forest/40' },
  { bar: 'bg-gold', hoverBorder: 'hover:border-gold/40' },
  { bar: 'bg-slate', hoverBorder: 'hover:border-slate/40' },
]

function FeatureCard({ title, body, accent }) {
  return (
    <div className={`border border-line bg-white/40 rounded-sm p-5 transition-colors ${accent.hoverBorder}`}>
      <div className={`w-6 h-1 ${accent.bar} mb-3`} />
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
    <section id="features" className="relative isolate overflow-hidden border-t border-line scroll-mt-24">
      <SectionGlow colors={['bg-slate/20', 'bg-gold/25']} />
      <div className="max-w-4xl mx-auto py-16">
        <p className="text-xs uppercase tracking-widest text-slate text-center mb-2">
          What you get
        </p>
        <h2 className="font-display text-3xl text-ink text-center mb-12">
          Built for the actual application, not just a score
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} accent={ACCENTS[i % ACCENTS.length]} />
          ))}
        </div>
      </div>
    </section>
  )
}
function StatsStrip() {
  const stats = [
    { n: '5', label: 'ATS engines modeled' },
    { n: '3–6', label: 'bullets red-penned per scan' },
    { n: '2', label: 'free scans a day' },
    { n: '8MB', label: 'max file size' },
  ]

  return (
    <section className="relative isolate overflow-hidden border-t border-line">
      <div className="max-w-4xl mx-auto py-12 grid grid-cols-2 sm:grid-cols-4 divide-x divide-line">
        {stats.map((s, i) => (
          <div key={i} className="text-center px-2">
            <p className="font-display text-3xl sm:text-4xl text-ink">{s.n}</p>
            <p className="text-xs text-slate mt-1 leading-snug">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

const GALLERY_CARDS = [
  {
    label: 'ATS Score Card',
    accent: 'border-forest',
    mock: (
      <div className="flex items-center justify-center h-24">
        <div className="w-16 h-16 rounded-full border-[3px] border-forest flex items-center justify-center rotate-3">
          <span className="font-display font-semibold text-xl text-forest">87</span>
        </div>
      </div>
    ),
  },
  {
    label: 'Red-pen Edit',
    accent: 'border-redline',
    mock: (
      <div className="h-24 flex flex-col justify-center gap-2">
        <div className="relative h-2 w-full bg-redline/20 rounded-sm">
          <span className="absolute inset-y-1/2 left-0 right-0 h-px bg-redline -translate-y-1/2" />
        </div>
        <div className="h-2 w-4/5 bg-forest/25 rounded-sm" />
        <div className="h-2 w-3/5 bg-slate/20 rounded-sm" />
      </div>
    ),
  },
  {
    label: 'Keyword Gap',
    accent: 'border-gold',
    mock: (
      <div className="h-24 flex flex-col justify-center gap-2 items-start">
        <span className="text-[10px] px-2 py-1 rounded-full border border-forest/40 text-forest">✓ React</span>
        <span className="text-[10px] px-2 py-1 rounded-full border border-redline/40 text-redline">✕ Docker</span>
        <span className="text-[10px] px-2 py-1 rounded-full border border-redline/40 text-redline">✕ Kubernetes</span>
      </div>
    ),
  },
  {
    label: 'Formatting Flags',
    accent: 'border-slate',
    mock: (
      <div className="h-24 flex flex-col justify-center gap-2">
        <div className="flex gap-2 items-start">
          <span className="text-gold shrink-0">⚑</span>
          <div className="h-2 w-full bg-slate/20 rounded-sm mt-1" />
        </div>
        <div className="flex gap-2 items-start">
          <span className="text-gold shrink-0">⚑</span>
          <div className="h-2 w-4/5 bg-slate/20 rounded-sm mt-1" />
        </div>
      </div>
    ),
  },
  {
    label: 'Job Match',
    accent: 'border-forest',
    mock: (
      <div className="h-24 flex flex-col justify-center gap-2">
        <div className="h-1.5 bg-line/60 rounded-full overflow-hidden">
          <div className="h-full w-[78%] bg-forest rounded-full" />
        </div>
        <p className="text-[10px] text-slate">78% match to job description</p>
      </div>
    ),
  },
]

function OutputGallery() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line scroll-mt-24">
      <SectionGlow colors={['bg-redline/20', 'bg-gold/20']} />
      <div className="max-w-6xl mx-auto py-16">
        <p className="text-xs uppercase tracking-widest text-slate text-center mb-2">
          What comes back
        </p>
        <h2 className="font-display text-3xl text-ink text-center mb-4">
          Every scan, marked up five ways
        </h2>
        <p className="text-sm text-slate text-center max-w-md mx-auto mb-10">
          Scroll through a sample of what one upload gets you — no two resumes get the same
          note twice.
        </p>
        <div className="gallery-scroll flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 px-4 -mx-4">
          {GALLERY_CARDS.map((c, i) => (
            <div
              key={i}
              className={`snap-start shrink-0 w-56 border-2 ${c.accent} bg-manuscript rounded-sm p-5
                shadow-[0_16px_32px_-16px_rgba(23,21,34,0.25)] hover:-translate-y-1.5 transition-transform`}
            >
              {c.mock}
              <p className="font-display text-sm text-ink mt-3">{c.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function HighlightBlock({ title, body, bullets, mock, reverse }) {
  return (
    <div className={`grid md:grid-cols-2 gap-10 items-center ${reverse ? 'md:[&>*:first-child]:order-2' : ''}`}>
      <div className="flex justify-center">
        <div className="w-full max-w-xs border border-line bg-white/50 rounded-sm p-6 shadow-sm">
          {mock}
        </div>
      </div>
      <div className="max-w-md">
        <h3 className="font-display text-2xl text-ink mb-3">{title}</h3>
        <p className="text-sm text-slate leading-relaxed mb-4">{body}</p>
        <ul className="space-y-2">
          {bullets.map((b, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink">
              <span className="text-redline shrink-0">✎</span> {b}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function FeatureHighlights() {
  return (
    <section id="how-it-helps" className="relative isolate overflow-hidden border-t border-line scroll-mt-24">
      <SectionGlow colors={['bg-forest/18', 'bg-redline/18']} />
      <div className="max-w-4xl mx-auto py-16 space-y-20">
        <HighlightBlock
          title="See exactly what a recruiter would flag"
          body="Every weak bullet gets struck through with a note on why it falls flat, then rewritten with a real action-verb-plus-metric structure — not generic advice."
          bullets={[
            'Vague, no-metric bullets called out one by one',
            'A concrete rewrite for each, ready to apply',
            'Applied changes update the score live',
          ]}
          mock={
            <div className="space-y-2">
              <div className="relative h-2.5 w-full bg-redline/20 rounded-sm">
                <span className="absolute inset-y-1/2 left-0 right-0 h-px bg-redline -translate-y-1/2" />
              </div>
              <div className="relative h-2.5 w-5/6 bg-redline/20 rounded-sm">
                <span className="absolute inset-y-1/2 left-0 right-0 h-px bg-redline -translate-y-1/2" />
              </div>
              <div className="h-px bg-line my-3" />
              <div className="h-2.5 w-full bg-forest/25 rounded-sm" />
              <div className="h-2.5 w-4/5 bg-forest/25 rounded-sm" />
            </div>
          }
        />

        <HighlightBlock
          reverse
          title="Know your score before you apply"
          body="Get parseability scores for the platforms companies actually run — Workday, Greenhouse, Lever, iCIMS, and Taleo — instead of one vague, unnamed number."
          bullets={[
            'One score per named engine, not an average',
            'Formatting flags tied to the exact issue',
            'A keyword-gap list scored against the job post',
          ]}
          mock={
            <div className="flex items-center justify-center py-4">
              <div className="w-24 h-24 rounded-full border-[3px] border-forest flex items-center justify-center -rotate-3">
                <span className="font-display font-semibold text-3xl text-forest">87</span>
              </div>
            </div>
          }
        />

        <HighlightBlock
          title="Track every application in one place"
          body="Once your resume is ready, keep the whole job search organized — from saved roles to offers — without a separate spreadsheet."
          bullets={[
            'Five stages: Saved, Applied, Interviewing, Offer, Rejected',
            'Notes and the job posting link on every card',
            'Signed-in history keeps every past scan, private to you',
          ]}
          mock={
            <div className="grid grid-cols-3 gap-2">
              {['bg-slate/20', 'bg-gold/25', 'bg-forest/25'].map((c, i) => (
                <div key={i} className="space-y-1.5">
                  <div className={`h-1.5 w-full rounded-full ${c}`} />
                  <div className="h-10 border border-line rounded-sm bg-manuscript" />
                  <div className="h-10 border border-line rounded-sm bg-manuscript" />
                </div>
              ))}
            </div>
          }
        />
      </div>
    </section>
  )
}

  

function PricingTeaser({ onUpgrade }) {
  return (
    <section id="pricing" className="relative isolate overflow-hidden border-t border-line scroll-mt-24">
      <SectionGlow colors={['bg-gold/25', 'bg-redline/20']} />
      <div className="max-w-4xl mx-auto py-16">
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
              <li className="flex gap-2"><span className="text-forest">✓</span> 3 analyses/day as a guest</li>
              <li className="flex gap-2"><span className="text-forest">✓</span> 10 analyses/day signed in</li>
              <li className="flex gap-2"><span className="text-forest">✓</span> Full ATS engine breakdown</li>
              <li className="flex gap-2"><span className="text-forest">✓</span> Red-pen rewrites &amp; .docx export</li>
              <li className="flex gap-2"><span className="text-forest">✓</span> Private history &amp; job tracker</li>
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
              <li className="flex gap-2"><span className="text-redline">✓</span> Everything in Free</li>
              <li className="flex gap-2"><span className="text-redline">✓</span> 100 analyses/day</li>
              <li className="flex gap-2"><span className="text-redline">✓</span> Cancel anytime</li>
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
    <section id="faq" className="relative isolate overflow-hidden border-t border-line scroll-mt-24">
      <SectionGlow colors={['bg-forest/22', 'bg-slate/20']} />
      <div className="max-w-2xl mx-auto py-16">
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
      </div>
    </section>
  )
}

export default function LandingSections({ onUpgrade }) {
  return (
    <>
      <StatsStrip />
      <OutputGallery />
      <HowItWorks />
      <FeatureHighlights />
      <FeatureGrid />
      <PricingTeaser onUpgrade={onUpgrade} />
      <FAQ />
    </>
  )
}
