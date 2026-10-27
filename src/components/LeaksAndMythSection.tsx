import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { PhoneMissed, Clock, FileText } from 'lucide-react';

const LEAKS = [
  {
    icon: PhoneMissed,
    title: 'Missed calls',
    stat: '~50%',
    text: 'of calls to cleaning businesses never reach a person.',
  },
  {
    icon: Clock,
    title: 'Slow replies',
    stat: '71%',
    text: 'of companies take over an hour to answer a web lead.',
  },
  {
    icon: FileText,
    title: 'Forgotten quotes',
    stat: '80%',
    text: 'of quotes are abandoned after a single follow-up.',
  },
];

export function LeaksAndMythSection() {
  return (
    <section id="the-leaks" className="relative z-10 w-full border-t border-ink/[0.06] bg-stone px-6 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="The problem"
          title="Three places jobs slip away every week"
          subtitle="None of them are sales problems. They're follow-up problems."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-3">
          {LEAKS.map((leak, i) => {
            const Icon = leak.icon;
            return (
              <FadeUp
                key={leak.title}
                delay={0.1 + i * 0.08}
                y={18}
                className="spotlight rounded-2xl border border-ink/[0.08] bg-white p-7 transition-[border-color,box-shadow] duration-300 hover:border-[#626262]/25 hover:shadow-[0_10px_30px_-18px_rgba(60,60,60,0.35)]"
              >
                <div className="flex items-center gap-2.5 text-sm font-medium text-muted">
                  <Icon className="h-4 w-4 text-accent" />
                  {leak.title}
                </div>
                <p className="mt-5 text-4xl font-bold tracking-tight text-ink tabular-nums">{leak.stat}</p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{leak.text}</p>
              </FadeUp>
            );
          })}
        </div>

        <FadeUp delay={0.15} y={16} className="mx-auto mt-16 max-w-2xl border-t border-ink/10 pt-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">The usual advice</p>
          <h3 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-ink">"Just get more leads."</h3>
          <p className="mt-4 text-base leading-relaxed text-muted">
            More leads into a leaky bucket just means paying more to lose more. Fix the leaks first, and the leads you
            already pay for start paying you back.
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
