import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { PhoneMissed, Clock, FileText } from 'lucide-react';

const LEAKS = [
  {
    icon: PhoneMissed,
    title: 'The missed call',
    text: 'About half of calls to home service businesses never reach a real person.',
  },
  {
    icon: Clock,
    title: 'The slow reply',
    text: "71% of companies take over an hour to answer a web lead. Customers won't wait.",
  },
  {
    icon: FileText,
    title: 'The forgotten quote',
    text: 'You send the estimate, follow up once, then get busy.',
  },
];

export function LeaksAndMythSection() {
  return (
    <section id="the-leaks" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-stone section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="The leaks" title="Jobs slip through the same three cracks every week" />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {LEAKS.map((leak, i) => {
            const Icon = leak.icon;
            return (
              <FadeUp
                key={leak.title}
                delay={0.1 + i * 0.08}
                y={18}
                className="spotlight flex flex-col rounded-2xl border border-ink/[0.08] bg-white p-7 transition-[border-color,box-shadow] duration-300 hover:border-ink/25 hover:shadow-hover-lift"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-drop bg-accent-soft text-accent">
                    <Icon className="h-[1.125rem] w-[1.125rem]" />
                  </span>
                  <span className="text-4xl font-bold leading-none tracking-tight text-ink/[0.12] tabular-nums">
                    0{i + 1}
                  </span>
                </div>
                <p className="mt-6 text-lg font-semibold text-ink">{leak.title}</p>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{leak.text}</p>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.15} y={14} className="mt-10 text-center">
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-ink">
            That's not a sales problem. <span className="text-accent">It's a follow-up problem.</span>
          </p>
        </FadeUp>

        <FadeUp delay={0.15} y={16} className="mx-auto mt-16 max-w-2xl border-t border-ink/10 pt-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">The myth</p>
          <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink">“You just need more leads.”</h3>
          <p className="mt-4 text-base leading-relaxed text-muted">
            That's what every agency says. More ads, more SEO, more Thumbtack. But more leads into a leaky bucket just
            means paying more to lose more.
          </p>
          <p className="mt-4 text-base font-semibold leading-relaxed text-ink">
            Fix the leaks first, and every lead you already pay for starts paying you back.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
