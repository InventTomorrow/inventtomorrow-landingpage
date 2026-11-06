import { CalendarDays, Check } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { CtaButton } from '../components/CtaButton';
import { FadeUp } from '../components/FadeUp';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { usePageMeta } from '../hooks/usePageMeta';
import { calendlyLink } from '../utils/navigation';

const BULLETS = [
  'Review your calls, quotes and bookings',
  'Identify what could come off your list',
  'Leave with a clear next step',
];

const inputClass =
  'w-full rounded-xs border border-border bg-paper px-4 py-3 text-base font-normal text-ink placeholder-primary/35 transition-colors select-text focus:border-accent focus:outline-2 focus:outline-offset-2 focus:outline-accent';

export function FreeAuditPage() {
  usePageMeta(
    'Your Business Audit | Invent Tomorrow',
    'Find where time is being lost in your calls, quotes and bookings, and what our system could take off your hands.',
  );

  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [sending, setSending] = useState(false);

  // Coming back from the calendar with the browser's back button: make the button usable again.
  useEffect(() => {
    const reset = () => setSending(false);
    window.addEventListener('pageshow', reset);
    return () => window.removeEventListener('pageshow', reset);
  }, []);

  // Carry the visitor's contact details and brief into the booking calendar.
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    window.location.assign(calendlyLink(name, email, { businessName, phone, description }));
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
            <span className="text-xs font-semibold text-accent">A clear starting point</span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold leading-[1.12] text-primary text-balance">
              What's taking up your day?
            </h2>
            <p className="mt-4 text-base sm:text-lg text-body">
              Choose a time to walk through your business. Bring the tasks you keep putting off and the follow-ups you keep
              chasing.
            </p>
            <ul className="mt-8 space-y-3">
              {BULLETS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-primary">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            {/* <SiteImage alt="A cleaner on a job" label="Audit image" width={560} height={360} className="mt-8 rounded-2xl" /> */}
          </FadeUp>

          <FadeUp
            delay={0.1}
            y={18}
            className="rounded-3xl border border-border bg-paper p-7 sm:p-10"
          >
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="audit-name" className="mb-2 block text-sm font-medium text-primary">
                  Full name
                </label>
                <input
                  id="audit-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="audit-business" className="mb-2 block text-sm font-medium text-primary">
                  Business name
                </label>
                <input
                  id="audit-business"
                  name="businessName"
                  type="text"
                  required
                  autoComplete="organization"
                  maxLength={160}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="audit-email" className="mb-2 block text-sm font-medium text-primary">
                  Email
                </label>
                <input
                  id="audit-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  maxLength={254}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="audit-phone" className="mb-2 block text-sm font-medium text-primary">
                  Phone number
                </label>
                <input
                  id="audit-phone"
                  name="phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  maxLength={40}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-describedby="audit-phone-hint"
                  className={inputClass}
                />
                <p id="audit-phone-hint" className="mt-2 text-sm text-body">Include your country code.</p>
              </div>
              <div>
                <label htmlFor="audit-description" className="mb-2 block text-sm font-medium text-primary">
                  Description <span className="font-normal text-body">(optional)</span>
                </label>
                <textarea
                  id="audit-description"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell us about your business and what you'd like help with."
                  className={`${inputClass} min-h-32 resize-y`}
                />
              </div>
              <p className="text-sm leading-relaxed text-body">
                Next, choose a time in our booking calendar. Your audit is booked when you complete the calendar
                confirmation.
              </p>
              <CtaButton type="submit" size="lg" icon={CalendarDays} className="w-full" disabled={sending}>
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
