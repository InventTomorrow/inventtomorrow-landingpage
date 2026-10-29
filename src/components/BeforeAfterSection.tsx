import { motion } from 'motion/react';
import { PhoneCall, FileText, Moon, Star, Repeat, ArrowRight, Check, type LucideIcon } from 'lucide-react';
import { SectionHeading } from './SectionHeading';

const ROWS: { icon: LucideIcon; before: string; after: string }[] = [
  { icon: PhoneCall, before: 'Stop during a job to answer calls', after: 'Keep cleaning while every caller gets a reply' },
  { icon: FileText, before: 'Chase quotes between jobs', after: 'Every quote gets followed up automatically' },
  { icon: Moon, before: 'You text customers at 10pm', after: 'Your evenings are yours again' },
  { icon: Star, before: 'Ask for reviews manually', after: 'Review requests go out after every clean' },
  { icon: Repeat, before: 'Remember who needs rebooking', after: 'Regulars are prompted to book again' },
];

const ease = [0.22, 1, 0.36, 1] as const;
// Each row transforms a beat after the previous one.
const rowDelay = (i: number) => 0.35 + i * 0.3;

const GRID = 'grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_3.5rem_minmax(0,1fr)]';

export function BeforeAfterSection() {
  return (
    <section id="before-after" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-stone section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Before and after" title="What changes in your week" />

        <motion.div
          initial="hidden"
          whileInView="shown"
          viewport={{ amount: 0.35 }}
          className="relative mt-14 overflow-hidden rounded-[1.75rem] border border-ink/[0.08] bg-white shadow-card-lg"
        >
          {/* Highlighted "After" column */}
          <div
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-[linear-gradient(180deg,var(--color-accent-soft)_0%,var(--color-mist)_100%)] md:block"
            aria-hidden="true"
          />

          {/* Column headings */}
          <div className={`relative border-b border-ink/[0.07] ${GRID}`}>
            <div className="px-6 pt-7 pb-2 sm:px-8 md:pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Before</p>
              <p className="mt-1 text-[0.9375rem] leading-relaxed text-muted">Calls, quotes and follow-ups keep pulling you away from the work.</p>
            </div>
            <div className="hidden md:block" />
            <div className="px-6 pt-2 pb-6 sm:px-8 md:pt-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">After</p>
              <p className="mt-1 text-[0.9375rem] font-medium leading-relaxed text-ink">The system keeps every opportunity moving while you stay focused on the clean.</p>
            </div>
          </div>

          {ROWS.map((row, i) => {
            const Icon = row.icon;
            const d = rowDelay(i);
            return (
              <div
                key={row.before}
                className={`spotlight relative border-b border-ink/[0.06] transition-colors duration-300 last:border-b-0 hover:bg-ink/[0.03] ${GRID} md:items-center`}
              >
                {/* Before: muted, struck through as the row transforms */}
                <div className="flex items-center gap-3 px-6 pt-5 sm:px-8 md:py-5">
                  <Icon className="h-[1.125rem] w-[1.125rem] shrink-0 text-ink/30" />
                  <motion.span
                    className="bg-no-repeat text-[0.9375rem] text-muted [background-image:linear-gradient(var(--color-muted),var(--color-muted))] [background-position:0_55%]"
                    variants={{
                      hidden: { backgroundSize: '0% 1.5px' },
                      shown: { backgroundSize: '100% 1.5px', transition: { delay: d, duration: 0.45, ease } },
                    }}
                  >
                    {row.before}
                  </motion.span>
                </div>

                {/* Arrow lights up once the row has transformed */}
                <div className="hidden justify-center md:flex">
                  <motion.span
                    className="flex h-8 w-8 items-center justify-center rounded-full border"
                    variants={{
                      hidden: { backgroundColor: 'var(--color-paper)', borderColor: 'var(--color-faint)', color: 'var(--color-muted)' },
                      shown: {
                        backgroundColor: 'var(--color-blue)',
                        borderColor: 'var(--color-blue)',
                        color: 'var(--color-paper)',
                        transition: { delay: d + 0.3, duration: 0.3 },
                      },
                    }}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </motion.span>
                </div>

                {/* After */}
                <motion.div
                  className="px-6 pb-5 pt-3 sm:px-8 md:py-5"
                  variants={{
                    hidden: { opacity: 0, x: -12 },
                    shown: { opacity: 1, x: 0, transition: { delay: d + 0.35, duration: 0.45, ease } },
                  }}
                >
                  <div className="flex items-center gap-3 rounded-xl bg-accent-soft/60 px-3 py-2.5 md:bg-transparent md:p-0">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                    <span className="text-[0.9375rem] font-medium text-ink">{row.after}</span>
                  </div>
                </motion.div>
              </div>
            );
          })}

          {/* Outcome */}
          <div className={`relative border-t border-ink/[0.07] bg-paper/70 md:bg-transparent ${GRID}`}>
            <div className="px-6 pt-6 sm:px-8 md:py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Result</p>
              <p className="mt-1 text-[0.9375rem] text-muted">Missed jobs and late nights</p>
            </div>
            <div className="hidden md:block" />
            <div className="px-6 pb-6 pt-3 sm:px-8 md:py-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Result</p>
              <p className="mt-1 text-[0.9375rem] font-semibold text-ink">More booked jobs, evenings back</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
