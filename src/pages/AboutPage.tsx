import {
  CircleDollarSign,
  Clock3,
  Focus,
  Handshake,
  Lightbulb,
  ShieldCheck,
  Users,
  Workflow,
  Wrench,
} from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { BuildScene, CleanScene } from '../components/illustrations/processScenes';
// import { FocusScene } from '../components/illustrations/processScenes';
// HoverCard replaced with line-style cards below
import { CtaButton } from '../components/CtaButton';
import { EmergeFromBehind } from '../components/EmergeFromBehind';
import { FadeUp } from '../components/FadeUp';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { TextLink } from '../components/TextLink';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { usePageMeta } from '../hooks/usePageMeta';
import { getFanOutStart } from '../utils/fanOut';
import { AUDIT_PATH, BOOKING_PATH } from '../utils/navigation';

const OUTCOMES = [
  { title: 'Save time', text: 'Reduce the repetitive work that slows down the day.', icon: Clock3 },
  { title: 'Reduce costs', text: 'Use smarter workflows to remove avoidable effort.', icon: CircleDollarSign },
  { title: 'Create focus', text: 'Give owners and teams more room for what matters.', icon: Focus },
];

const BELIEFS = [
  { title: 'People first. Always.', text: 'We build systems that fit your team, not the other way around.', icon: Handshake },
  {
    title: 'Solve real problems',
    text: 'We build practical systems that fix real problems and make everyday work easier.',
    icon: Workflow,
  },
  { title: 'Keep it simple', text: 'We make work easier, not more complicated.', icon: ShieldCheck },
];

const STRENGTHS = [
  { label: 'Technical skills', icon: Wrench },
  { label: 'Fresh ideas', icon: Lightbulb },
  { label: 'Practical approach', icon: Focus },
];

export function AboutPage() {
  const columns = useMediaQuery('(min-width: 48rem)') ? 3 : 1;

  usePageMeta(
    'About Us | Invent Tomorrow',
    'Invent Tomorrow builds simple, reliable automation systems that make everyday work easier for cleaning businesses.',
  );

  return (
    <>
      <PageHero
        eyebrow="About Invent Tomorrow"
        title="Making cleaning businesses"
        titleMuted="easier to run."
        description="We're Invent Tomorrow, a team that works with cleaning businesses to solve everyday challenges and build simpler ways to work."
      >
        <CtaButton size="lg" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
        <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH}>
          Schedule a Call
        </CtaButton>
      </PageHero>

      <Section bg="paper" width="max-w-5xl">
        <SectionHeading
          scene={CleanScene}
          eyebrow="Our mission"
          title="We build simple systems that cut paperwork, save time, reduce costs, and help cleaning businesses grow."
        />
        <div className="mt-14 grid grid-cols-1 divide-y divide-ink/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0 md:-mx-9 md:mt-5">
          {OUTCOMES.map((item, i) => {
            const Icon = item.icon;
            return (
              <EmergeFromBehind
                key={item.title}
                start={getFanOutStart(i, OUTCOMES.length, columns)}
                className="spotlight py-8 max-md:first:pt-0 max-md:last:pb-0 md:p-9"
                innerClassName="group"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-drop bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{item.text}</p>
              </EmergeFromBehind>
            );
          })}
        </div>
      </Section>

      <Section bg="stone" width="max-w-5xl">
        <SectionHeading
          scene={BuildScene}
          eyebrow="What we believe"
          title="Three principles guide every system we design and every decision we make."
        />
        <div className="mt-14 grid grid-cols-1 divide-y divide-ink/[0.08] md:grid-cols-3 md:divide-x md:divide-y-0 md:-mx-9 md:mt-5">
          {BELIEFS.map((item, i) => {
            const Icon = item.icon;
            return (
              <EmergeFromBehind
                key={item.title}
                start={getFanOutStart(i, BELIEFS.length, columns)}
                className="spotlight py-8 max-md:first:pt-0 max-md:last:pb-0 md:p-9"
                innerClassName="group"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-drop bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-3xl font-bold leading-none tracking-tight tabular-nums text-ink/[0.07]">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-ink">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{item.text}</p>
              </EmergeFromBehind>
            );
          })}
        </div>
      </Section>

      <Section bg="mist" width="max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
          <FadeUp y={16}>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Our team</span>
            <h2 className="mt-4 text-3xl sm:text-[2.75rem] font-bold leading-[1.12] tracking-tight text-ink text-balance">
              The minds behind Invent Tomorrow
            </h2>
            <p className="mt-4 text-base sm:text-lg leading-relaxed text-muted">
              We're practical thinkers who make everyday work easier.
            </p>
          </FadeUp>

          <FadeUp
            delay={0.1}
            y={18}
            className="spotlight rounded-3xl border border-ink/[0.08] bg-white p-8 shadow-card sm:p-10"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-white">
              <Users className="h-5 w-5" />
            </span>
            <p className="mt-6 text-xl font-semibold leading-snug tracking-tight text-ink">
              We combine technical expertise and fresh ideas to build simple systems that work.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {STRENGTHS.map(({ label, icon: Icon }) => (
                <div key={label} className="flex items-center gap-2.5 rounded-xl bg-mist px-4 py-3 text-sm font-medium text-ink">
                  <Icon className="h-4 w-4 shrink-0 text-accent" />
                  {label}
                </div>
              ))}
            </div>
            <TextLink to={BOOKING_PATH} className="mt-8 inline-block text-sm">
              Meet the people behind Invent Tomorrow
            </TextLink>
          </FadeUp>
        </div>
      </Section>

      <FinalCtaSection
        title="Let's get in touch"
        body="Show us how work moves through your business. We'll find the best place to automate first."
        smallLine="Audit first. Automate what matters."
      />
    </>
  );
}
