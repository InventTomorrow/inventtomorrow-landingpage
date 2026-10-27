import { motion } from 'motion/react';
import { Plug, PenLine, PhoneCall, Send, Star, Repeat, type LucideIcon } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';

const YOUR_PART = [
  { title: 'One kickoff call', text: 'We learn your prices, services and service area.', time: '45 min' },
  { title: 'Approve your messages', text: "Nothing goes out until you've read it.", time: 'Once' },
  { title: 'Keep doing great work', text: "That's it. We take it from here.", time: 'Every day' },
];

const OUR_PART: { label: string; icon: LucideIcon }[] = [
  { label: 'Connect your calendar and phone', icon: Plug },
  { label: 'Write every message in your voice', icon: PenLine },
  { label: 'Text back every missed call', icon: PhoneCall },
  { label: 'Follow up on every quote', icon: Send },
  { label: 'Ask happy clients for reviews', icon: Star },
  { label: 'Rebook past clients', icon: Repeat },
];

export function DoneForYouSection() {
  return (
    <section id="who-we-help" className="relative z-10 w-full border-t border-ink/[0.06] bg-paper px-6 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeading eyebrow="Done for you" title="Your part takes under an hour" subtitle="Here's who does what." />

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
          {/* Your part */}
          <FadeUp
            delay={0.1}
            y={18}
            className="spotlight flex flex-col rounded-3xl border border-ink/[0.08] bg-white p-8 shadow-[0_24px_50px_-34px_rgba(15,27,45,0.35)] transition-colors duration-300 hover:border-[#626262]/25 sm:p-10"
          >
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Your part</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-ink">About 1 hour</p>
              </div>
              <span className="rounded-full bg-stone px-3 py-1 text-xs font-medium text-muted">Total, once</span>
            </div>

            <ol className="relative mt-8 flex-1 space-y-7">
              {/* Thin rail joining the step numbers */}
              <span className="absolute bottom-3 left-[0.9375rem] top-3 w-px bg-ink/10" aria-hidden="true" />
              {YOUR_PART.map((item, i) => (
                <li key={item.title} className="relative flex gap-4">
                  <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-ink/15 bg-white text-sm font-semibold text-ink">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-semibold text-ink">{item.title}</p>
                      <span className="shrink-0 text-xs font-semibold text-accent">{item.time}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </FadeUp>

          {/* Our part */}
          <FadeUp
            delay={0.18}
            y={18}
            className="relative flex flex-col overflow-hidden rounded-3xl bg-ink p-8 text-white shadow-[0_30px_60px_-30px_rgba(15,27,45,0.7)] sm:p-10"
          >
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/30 blur-[90px]"
              aria-hidden="true"
            />
            <div className="relative flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-light">Our part</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">Everything else</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-light opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-light" />
                </span>
                Running day and night
              </span>
            </div>

            <ul className="relative mt-8 grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              {OUR_PART.map(({ label, icon: Icon }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.4 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="spotlight spotlight-light flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 text-accent-light">
                    <Icon className="h-[1.125rem] w-[1.125rem]" />
                  </span>
                  <span className="text-sm font-medium leading-snug text-white/90">{label}</span>
                </motion.li>
              ))}
            </ul>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}
