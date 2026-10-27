import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';

const FAQS = [
  {
    q: 'Will it sound like a robot?',
    a: 'No. We write every message in your voice, and nothing goes out until you approve it.',
  },
  {
    q: 'Do I have to learn new software?',
    a: 'No. We set it up and run it. You keep using the tools you already have.',
  },
  {
    q: 'Will it work with my tools?',
    a: 'Most likely. We connect to Jobber, Housecall Pro, OpenPhone, Stripe, QuickBooks and more, and we confirm yours during the audit.',
  },
  {
    q: 'How fast will I see results?',
    a: 'Missed Call Rescue works from the day we switch it on. Quote Revival is built to book cleans within 14 days.',
  },
  {
    q: "What if it doesn't work?",
    a: "That's what the 90-day guarantee is for. If we don't book jobs that cover our fee within 90 days, we keep working for free until we do.",
  },
  {
    q: 'Am I locked into a contract?',
    a: "No. It's month to month. Pause or cancel any time.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 w-full border-t border-ink/[0.06] bg-paper px-6 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Fair questions" />

        <FadeUp delay={0.1} y={16} className="mt-12 border-t border-ink/10">
          {FAQS.map((faq, idx) => {
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
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink/60 transition-colors group-hover:border-[#626262]/40 group-hover:bg-[#ececec] group-hover:text-ink"
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
                      <p className="pb-6 pr-14 text-base leading-relaxed text-muted">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </FadeUp>
      </div>
    </section>
  );
}
