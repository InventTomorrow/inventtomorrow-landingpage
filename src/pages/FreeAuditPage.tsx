import { useEffect, useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { FadeUp } from '../components/FadeUp';
import { CtaButton } from '../components/CtaButton';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { usePageMeta } from '../hooks/usePageMeta';
import { calendlyLink } from '../utils/navigation';

const BULLETS = [
  'Review your calls, quotes and bookings',
  'Identify what could come off your list',
  'Leave with a clear next step',
];

const inputClass =
  'w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-base text-ink placeholder-ink/35 transition-colors select-text focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15';

export function FreeAuditPage() {
  usePageMeta(
    'Your Business Audit | Invent Tomorrow',
    'Find where time is being lost in your calls, quotes and bookings, and what our system could take off your hands.',
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  // Coming back from the calendar with the browser's back button: make the button usable again.
  useEffect(() => {
    const reset = () => setSending(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  // Opens the booking calendar with the visitor's name and email already filled in.
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    window.location.assign(calendlyLink(name.trim(), email.trim()));
  };

  return (
    <>
      <PageHero
        eyebrow="Your business audit"
        title="Discover the hours you could reclaim"
        description="Walk us through how you handle calls, quotes, and bookings. Your audit shows where time is being lost and what our system could take off your hands."
      />

      <Section bg="paper" width="max-w-[70rem]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <FadeUp y={16} className="lg:sticky lg:top-32 lg:self-start">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">A clear starting point</span>
            <h2 className="mt-4 text-3xl sm:text-[2.5rem] font-bold leading-[1.12] tracking-tight text-ink text-balance">
              What's taking up your day?
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted">
              Choose a time to walk through your business. Bring the tasks you keep putting off and the follow-ups you keep
              chasing.
            </p>
            <ul className="mt-8 space-y-3">
              {BULLETS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-ink">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </FadeUp>

          <FadeUp
            delay={0.1}
            y={18}
            className="rounded-3xl border border-ink/[0.08] bg-white p-7 shadow-[0_24px_50px_-34px_rgba(15,27,45,0.35)] sm:p-10"
          >
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="audit-name" className="mb-2 block text-sm font-medium text-ink">
                  Full name
                </label>
                <input
                  id="audit-name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="audit-email" className="mb-2 block text-sm font-medium text-ink">
                  Work email
                </label>
                <input
                  id="audit-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <p className="text-sm leading-relaxed text-muted">
                Next, choose a time in our booking calendar. Your audit is booked when you complete the calendar
                confirmation.
              </p>
              <CtaButton type="submit" size="lg" className="w-full" disabled={sending}>
                {sending ? 'Opening the calendar…' : 'Choose My Audit Time'}
              </CtaButton>
            </form>
          </FadeUp>
        </div>
      </Section>

      <FinalCtaSection
        title="Prefer to talk it through?"
        body="Choose a time to walk through your business and the tasks taking up your day."
        buttons="call"
      />
    </>
  );
}
