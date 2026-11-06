import {
  CircleDollarSign,
  Clock3,
  Focus,
  Handshake,
  Lightbulb,
  ShieldCheck,
  Workflow,
  Wrench
} from 'lucide-react';
import { AboutCollage } from '../components/AboutCollage';
import { CtaButton } from '../components/CtaButton';
import { FadeUp } from '../components/FadeUp';
import { Reveal } from '../components/Reveal';
import { FinalCtaSection } from '../components/FinalCtaSection';
import { PageHero } from '../components/PageHero';
import { ProcessSteps } from '../components/ProcessSteps';
import { Section } from '../components/Section';
import { SectionHeading } from '../components/SectionHeading';
import { StatsSection } from '../components/StatsSection';
import { BuildScene } from '../components/illustrations/processScenes';
import { usePageMeta } from '../hooks/usePageMeta';
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
        <CtaButton size="lg" variant="accent" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
        <CtaButton size="lg" variant="outline-light" to={BOOKING_PATH}>
          Schedule a Call
        </CtaButton>
      </PageHero>

      <Section bg="paper" width="max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <Reveal variant="left" distance={48}>
            <AboutCollage badgeValue="Done" badgeLabel="for you" />
          </Reveal>

          <div>
            <SectionHeading
              align="left"
              eyebrow="Our Mission"
              title="Less paperwork. More bookings."
              titleMuted="Faster growth for your cleaning business."
            />
            <ul className="mt-8 flex flex-col gap-6 border-l-4 border-accent pl-6">
              {OUTCOMES.map((item, index) => {
                const Icon = item.icon;
                return (
                  <FadeUp key={item.title} delay={0.1 + index * 0.08} y={14}>
                    <li className="flex items-start gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xs bg-accent-soft text-accent">
                        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-primary">{item.title}</h3>
                        <p className="mt-1 text-base">{item.text}</p>
                      </div>
                    </li>
                  </FadeUp>
                );
              })}
            </ul>
          </div>
        </div>
      </Section>

      <StatsSection isDark />

      <Section bg="soft" width="max-w-5xl">
        <SectionHeading
          scene={BuildScene}
          eyebrow="What we believe"
          title="Our Three Standards"
        />
        <div className="mt-14">
          <ProcessSteps steps={BELIEFS} perRow={3} />
        </div>
      </Section>

      {/* <Section bg="paper" width="max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal variant="zoom">
            <CircleCollage icon={Users} />
          </Reveal>

          <div>
            <SectionHeading align="left" eyebrow="Our team" title="The minds behind Invent Tomorrow" subtitle="We're practical thinkers who make everyday work easier." />

            <FadeUp delay={0.1} y={18} className="mt-8 rounded-3xl border border-border bg-paper p-8">
              <p className="font-display text-xl font-semibold leading-snug text-primary">
                We combine technical expertise and fresh ideas to build simple systems that work.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {STRENGTHS.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2.5 rounded-xl bg-stone px-4 py-3 text-sm font-medium text-primary">
                    <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                    {label}
                  </div>
                ))}
              </div>
              <TextLink to={BOOKING_PATH} className="mt-6 inline-block text-sm">
                Meet the people behind Invent Tomorrow
              </TextLink>
            </FadeUp>
          </div>
        </div>
      </Section> */}

      <FinalCtaSection
        title="Let's get in touch"
        body="Show us how work moves through your business. We'll find the best place to automate first."
        smallLine="Audit first. Automate what matters."
      />
    </>
  );
}
