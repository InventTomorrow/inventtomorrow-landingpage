import { Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import type { Faq } from '../content/faq';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';

function FaqList({ faqs }: { faqs: Faq[] }) {
  // The first answer starts open.
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="border-t border-ink/10">
      {faqs?.map((faq, idx) => {
        const isOpen = openIndex === idx;
        const panelId = `faq-panel-${idx}`;
        return (
          <div key={faq.q} className="spotlight border-b border-ink/10">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : idx)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="group flex w-full items-center justify-between gap-6 py-6 text-left cursor-pointer"
            >
              <span className="text-base sm:text-lg font-semibold text-ink">{faq.q}</span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors group-hover:border-ink/40 group-hover:bg-surface-raised group-hover:text-ink"
              >
                <Plus className="h-4 w-4" />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={panelId}
                  key="answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <p className="pb-6 pr-14 text-base leading-relaxed text-muted select-text">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
    <section id="faq" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-paper section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="FAQ questions" />
        <FadeUp delay={0.1} y={16} className="mt-12">
          <FaqList faqs={faqs} />
        </FadeUp>
        {showAllLink && (
          <FadeUp delay={0.15} y={12} className="mt-10 text-center text-sm text-muted">
            More questions? <TextLink to="/faq">See all answers</TextLink>
          </FadeUp>
        )}
      </div>
    </section>
  );
}

// FAQ page: intro on the left (stays in place while you scroll), questions on the right.
export function FaqSplitSection({ faqs }: { faqs: Faq[] }) {
  return (
    <section className="relative z-10 w-full bg-fade-paper section-y section-deco px-6 sm:px-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <FadeUp y={16} className="lg:sticky lg:top-32 lg:self-start">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Before you start</span>
          <h2 className="mt-4 text-3xl sm:text-[2.5rem] font-bold leading-[1.12] tracking-tight text-ink text-balance">
            What business owners ask
          </h2>
          <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted">
            Clear answers about setup, tools, messages, support and what happens next.
          </p>
        </FadeUp>
        <FadeUp delay={0.1} y={16}>
          <FaqList faqs={faqs} />
        </FadeUp>
      </div>
    </section>
  );
}
