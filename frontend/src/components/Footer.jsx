// EDIT ME — replace these with your real details before deploying.
const CONTACT_EMAIL = 'shaileshmadde650@email.com'
const LOCATION = 'Gauri Khurd, Gauri Bazar, Deoria (274202) U.P, India'
const SOCIAL_LINKS = {
  linkedin: 'https://www.linkedin.com/in/shailesh-maddhesiya-990451209/',
  instagram: 'https://www.instagram.com/shailesh_maddh/',
  x: 'https://x.com/ShaileshMaddh17',
}

function IconButton({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 rounded-full border border-manuscript/25 flex items-center justify-center
        text-manuscript/80 hover:border-redline hover:text-redline hover:bg-redline/10 transition-colors"
    >
      {children}
    </a>
  )
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18.3 3H21l-6.9 7.9L22.2 21h-6.5l-5-6.5L4.8 21H2l7.4-8.5L1.9 3h6.6l4.5 6z"
        fill="currentColor"
      />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.6 3.5a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2ZM3 9h3.3v11.5H3V9Zm6.4 0h3.16v1.57h.05c.44-.83 1.52-1.7 3.13-1.7 3.35 0 3.97 2.2 3.97 5.07v6.56h-3.3v-5.82c0-1.39-.03-3.17-1.93-3.17-1.94 0-2.24 1.51-2.24 3.07v5.92H9.4V9Z"
        fill="currentColor"
      />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2.5" y="4.5" width="19" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6l8.5 6.5L20.5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path
        d="M12 21s7-6.6 7-11.5A7 7 0 0 0 5 9.5C5 14.4 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export default function Footer({ setView, onGoHome }) {
  function goToSection(id) {
    onGoHome()
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
      }, 60)
    })
  }

  function backToTop() {
    onGoHome()
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }))
  }

  const siteMap = [
    { label: 'Home', action: () => backToTop() },
    { label: 'How it works', action: () => goToSection('how-it-works') },
    { label: 'Features', action: () => goToSection('features') },
    { label: 'Pricing', action: () => goToSection('pricing') },
    { label: 'FAQ', action: () => goToSection('faq') },
  ]

  return (
    <footer className="mt-24 bg-ink text-manuscript relative overflow-hidden isolate">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-20 left-1/4 w-[420px] h-[420px] rounded-full bg-redline/15 blur-[110px]" />
        <div className="absolute -bottom-32 right-1/4 w-[420px] h-[420px] rounded-full bg-forest/15 blur-[110px]" />
      </div>
      <div className="max-w-4xl mx-auto px-4 py-16 grid md:grid-cols-[1.4fr_1fr_1fr] gap-10">
        <div>
          <p className="font-display text-2xl mb-3">
            Redline<span className="text-redline">.</span>
          </p>
          <p className="text-sm text-manuscript/60 max-w-xs mb-6 leading-relaxed">
            Get your resume marked up like a recruiter would — a free ATS score, red-pen
            rewrites, and a Pro tier for when you need more.
          </p>

          <div className="flex items-center gap-3 mb-5">
            <IconButton href={SOCIAL_LINKS.linkedin} label="LinkedIn">
              <LinkedInIcon />
            </IconButton>
            <IconButton href={SOCIAL_LINKS.instagram} label="Instagram">
              <InstagramIcon />
            </IconButton>
            <IconButton href={SOCIAL_LINKS.x} label="X (Twitter)">
              <XIcon />
            </IconButton>
            <IconButton href={`mailto:${CONTACT_EMAIL}`} label="Email">
              <MailIcon />
            </IconButton>
          </div>

          <div className="flex items-center gap-2 text-xs text-manuscript/50 mb-6">
            <PinIcon />
            {LOCATION}
          </div>

          <button
            onClick={backToTop}
            className="inline-flex items-center gap-2 border border-manuscript/25 text-xs
              uppercase tracking-widest px-4 py-2 rounded-sm hover:border-redline hover:text-redline
              transition-colors"
          >
            ↑ Back to top
          </button>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-manuscript/40 mb-4">Site map</p>
          <ul className="space-y-2.5 text-sm">
            {siteMap.map((item) => (
              <li key={item.label}>
                <button
                  onClick={item.action}
                  className="text-manuscript/75 hover:text-redline transition-colors"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-manuscript/40 mb-4">Legal</p>
          <ul className="space-y-2.5 text-sm">
            <li>
              <button
                onClick={() => setView('privacy')}
                className="text-manuscript/75 hover:text-redline transition-colors"
              >
                Privacy Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => setView('terms')}
                className="text-manuscript/75 hover:text-redline transition-colors"
              >
                Terms of Service
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gold text-ink text-center text-xs py-3 px-4">
        © {new Date().getFullYear()} Redline. All rights reserved.
      </div>
    </footer>
  )
}
