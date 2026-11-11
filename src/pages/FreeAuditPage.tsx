import { Check } from 'lucide-react';
import { AuditChat } from '../components/AuditChat';
import { FadeUp } from '../components/FadeUp';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { Section } from '../components/Section';
import { PAGE_META } from '../content/pages';
import { usePageMeta } from '../hooks/usePageMeta';

const BULLETS = [
  'Review your calls, quotes and bookings',
  'Identify what could come off your list',
  'Leave with a clear next step',
];

export function FreeAuditPage() {
  usePageMeta(PAGE_META.freeAudit);

  return (
    <div className="screen-sections">
      <Section bg="paper" width="max-w-[70rem]" showDecoration={false} className="max-sm:px-4 max-sm:py-10">
        <div className="grid min-w-0 grid-cols-1 gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-16">
          <FadeUp y={16} className="lg:sticky lg:top-32 lg:self-start">
            <span className="text-xs font-semibold text-accent">A clear starting point</span>
            <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-[1.12] text-primary text-balance">
              What's taking up your day?
            </h1>
            <p className="mt-4 text-base sm:text-lg text-body">
              Chat with our assistant to get booked in, or ask it anything first. Bring the tasks you keep putting off and the follow ups you keep
              chasing.
            </p>
            <ul className="hidden sm:mt-8 sm:block sm:space-y-3">
              {BULLETS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-primary">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
            {/* <SiteImage alt="A cleaner on a job" label="Audit image" width={560} height={360} className="mt-8 rounded-2xl" /> */}
          </FadeUp>

          <FadeUp delay={0.1} y={18} className="min-w-0">
            <AuditChat />
          </FadeUp>
        </div>
      </Section>

      <FinalCtaSection
        title="Prefer to talk it through?"
        body="Choose a time to walk through your business and the tasks taking up your day."
        buttons="call"
      />
    </div>
  );
}
