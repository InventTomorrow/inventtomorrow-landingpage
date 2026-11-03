import {
  BadgeCheck,
  CalendarClock,
  CalendarSync,
  Clock,
  MessageSquareReply,
  MessageSquareText,
  Repeat,
  Send,
  SprayCan,
  Star,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { getFanOutStart, type FanOutStart } from '../utils/fanOut';
import { CurvedArrow } from './CurvedArrow';
import { EmergeFromBehind } from './EmergeFromBehind';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';

const YOUR_PART: { title: string; text: string; time: string; icon: LucideIcon }[] = [
  { title: 'Join one 45-minute kickoff call', text: 'We learn your prices, services and service area.', time: '45 min', icon: CalendarClock },
  { title: 'Approve your messages once', text: "Nothing goes out until you've read it.", time: 'Once', icon: BadgeCheck },
  { title: 'Deliver great cleaning work', text: "That's it. We take it from here.", time: 'Every day', icon: SprayCan },
];

const OUR_PART: { label: string; icon: LucideIcon }[] = [
  { label: 'Connect your calendar and phone', icon: CalendarSync },
  { label: 'Write every message in your voice', icon: MessageSquareText },
  { label: 'Text back every missed call', icon: MessageSquareReply },
  { label: 'Follow up on every quote', icon: Send },
  { label: 'Request a review after every clean', icon: Star },
  { label: 'Rebook past clients', icon: Repeat },
];

// Wide screens: our card starts tucked behind yours, up and to the left, and slides out to its place.
const SYSTEM_CARD_START: FanOutStart = { fromX: -30, fromY: -22, delay: 0.3, layer: 1 };
const WIDE_QUERY = '(min-width: 64rem)';

export function DoneForYouSection() {
  const isWide = useMediaQuery(WIDE_QUERY);
  const systemCardStart = isWide ? SYSTEM_CARD_START : getFanOutStart(1, 2, 1);

  return (
    <section id="done-for-you" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-paper section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Done for you"
          title="You focus on the clean. We handle the follow-up."
          subtitle="A clear split of responsibilities so nothing gets missed and nothing pulls you away from the job."
        />

        {/* Wide screens: your card sits on top, ours overlaps its bottom-right corner from behind, and an arrow carries the hand-off. */}
        <div className="relative mt-14 grid grid-cols-1 lg:grid-cols-12">
          <FadeUp
            delay={0.1}
            y={18}
            className="relative z-20 flex flex-col rounded-3xl border border-ink/[0.08] bg-white p-7 shadow-card-lg sm:p-9 lg:col-start-1 lg:col-end-8 lg:row-start-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Your focus</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">About 1 hour</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-ink/[0.08] bg-stone px-3 py-1.5 text-xs font-medium text-muted">
                <Clock className="h-3.5 w-3.5 text-accent" />
                Total, once
              </span>
            </div>

            <ol className="-mx-4 -mb-5 mt-2 divide-y divide-ink/[0.08]">
              {YOUR_PART.map(({ title, text, time, icon: Icon }) => (
                <li key={title} className="spotlight group flex gap-4 px-4 py-5">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-drop bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold leading-snug text-ink">{title}</p>
                      <span className="shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">{time}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </FadeUp>

          <div className="flex justify-center py-3 lg:hidden">
            <CurvedArrow variant="down" className="h-20 w-auto" />
          </div>
          <div className="pointer-events-none hidden items-end pb-10 pl-4 lg:col-start-8 lg:col-end-13 lg:row-start-1 lg:flex">
            <CurvedArrow variant="sweep" className="w-full max-w-[24rem]" />
          </div>

          <EmergeFromBehind
            start={systemCardStart}
            className="lg:col-start-6 lg:col-end-13 lg:row-start-2 lg:-mt-8"
            innerClassName="flex h-full flex-col overflow-hidden rounded-3xl bg-navy p-7 text-white shadow-card-dark sm:p-9 lg:pt-14"
          >
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue/30 blur-[90px]" aria-hidden="true" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky">Our system</p>
                <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Everything else</p>
              </div>
              <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/80">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky opacity-60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky" />
                </span>
                Running day and night
              </span>
            </div>

            <ul className="relative -mx-5 mt-7 grid grid-cols-1 sm:grid-cols-2">
              {OUR_PART.map(({ label, icon: Icon }, i) => (
                <motion.li
                  key={label}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.4 }}
                  transition={{ delay: 0.55 + i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="spotlight spotlight-light flex items-center gap-3.5 border-white/10 px-5 py-4 max-sm:not-first:border-t sm:nth-[n+3]:border-t sm:odd:border-r"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-drop bg-white/10 text-sky">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-sm font-medium leading-snug text-white/90">{label}</span>
                </motion.li>
              ))}
            </ul>
          </EmergeFromBehind>
        </div>

        <FadeUp delay={0.15} y={14} className="mt-12 text-center">
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-ink">
            You stay present on the job. <span className="text-accent">Every opportunity keeps moving.</span>
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
