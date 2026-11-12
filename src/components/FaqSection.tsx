import { Plus } from 'lucide-react';
import { useId } from 'react';
import type { Faq } from '../content/faq';
import { FadeUp } from './FadeUp';
import { SiteImage } from './SiteImage';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';

function FaqList({ faqs }: { faqs: Faq[] }) {
  // Native disclosures keep every answer in the HTML and work before JavaScript loads.
  const groupName = useId();

  return (
    <div className="border-t border-border">
      {faqs?.map((faq, idx) => {
        return (
          <details key={faq.q} name={groupName} open={idx === 0} className="group border-b border-border">
            <summary
              className="flex w-full list-none items-center justify-between gap-4 py-6 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:gap-6 [&::-webkit-details-marker]:hidden"
            >
              <span className="min-w-0 flex-1 font-display text-base sm:text-lg font-semibold text-primary">{faq.q}</span>
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-primary/60 transition-colors group-hover:border-accent group-hover:bg-stone group-hover:text-primary"
              >
                <Plus className="h-4 w-4 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none" aria-hidden="true" />
              </span>
            </summary>
            <p className="pb-6 text-base leading-relaxed text-ink select-text sm:pr-12">{faq.a}</p>
          </details>
        );
      })}
    </div>
  );
}

interface FaqSectionProps {
  faqs: Faq[];
  // Home page: link to the full FAQ page
  showAllLink?: boolean;
}

// Short FAQ on the home page.
export function FaqSection({ faqs, showAllLink = false }: FaqSectionProps) {
  return (
    <section id="faq" className="relative z-10 w-full bg-paper section-y section-deco px-6 sm:px-12">
      <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-14">
        <div className="min-w-0 lg:sticky lg:top-28">
          <SectionHeading align="left" size="compact" eyebrow="FAQ" title="Your questions, answered" />
          {showAllLink && (
            <p className="mt-5 text-sm text-body">
              More questions? <TextLink to="/faq">See all answers</TextLink>
            </p>
          )}
        </div>
        <div className="min-w-0">
          <FaqList faqs={faqs} />
        </div>
      </div>
    </section>
  );
}

// FAQ page: intro on the left (stays in place while you scroll), questions on the right.
export function FaqSplitSection({ faqs }: { faqs: Faq[] }) {
  return (
    <section className="relative z-10 w-full bg-paper section-y section-deco px-6 sm:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <FadeUp y={16} className="lg:sticky lg:top-32 lg:self-start">
          <span className="text-xs font-semibold text-accent">Before you start</span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold leading-[1.12] text-primary text-balance">
            What business owners ask
          </h2>
          <p className="mt-4 text-base sm:text-lg text-body">
            Clear answers about setup, tools, messages, support and what happens next.
          </p>
          <SiteImage alt="Talking through your questions" label="FAQ image" width={480} height={320} className="mt-8 rounded-2xl" />
        </FadeUp>
        <FadeUp delay={0.1} y={16}>
          <FaqList faqs={faqs} />
        </FadeUp>
      </div>
    </section>
  );
}
