interface FooterProps {
  onNavigate?: (id: string) => void;
  onOpenAudit?: () => void;
}

const EXPLORE_LINKS = [
  { id: 'the-leaks', label: 'The problem' },
  { id: 'services', label: 'The system' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'faq', label: 'FAQ' },
];

const linkClass = 'text-left text-white/60 hover:text-white transition-colors cursor-pointer';

export function Footer({ onNavigate, onOpenAudit }: FooterProps) {
  const handleNav = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative z-10 w-full border-t border-white/10 bg-ink-deep px-6 pt-16 pb-12 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-12 md:grid-cols-12">
          <div className="md:col-span-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-xs font-bold text-white">IT</span>
              <span className="text-lg font-semibold tracking-tight text-white">Invent Tomorrow</span>
            </div>
            <p className="mt-4 text-base text-white/80">Win back the jobs you already earned.</p>
            <p className="mt-1 text-sm text-white/50">Follow-up systems for cleaning businesses.</p>
          </div>

          <div className="flex flex-col gap-3 text-sm md:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Explore</span>
            {EXPLORE_LINKS.map((link) => (
              <button key={link.id} type="button" onClick={() => handleNav(link.id)} className={linkClass}>
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 text-sm md:col-span-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">Get started</span>
            <button type="button" onClick={onOpenAudit} className={linkClass}>
              Free audit
            </button>
            <button type="button" onClick={() => handleNav('founding-offer')} className={linkClass}>
              Founding clients
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 pt-8 text-xs text-white/40 sm:flex-row">
          <p>© 2026 Invent Tomorrow</p>
          <div className="flex gap-6">
            <span>Privacy Policy</span>
            <span>Terms</span>
            <span>SMS Consent</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
