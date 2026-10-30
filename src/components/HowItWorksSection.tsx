import { Coffee, PenLine, Search, type LucideIcon } from 'lucide-react';
// import { ArrowRight } from 'lucide-react';
import type { ComponentType } from 'react';
import { AUDIT_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { FadeUp } from './FadeUp';
import { AuditScene, BuildScene, CleanScene } from './illustrations/processScenes';
import { PathwaySteps, type PathwayStep } from './PathwaySteps';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';

interface Step {
  title: string;
  description: string;
  note: string;
  icon: LucideIcon;
  scene: ComponentType;
}

const STEPS: Step[] = [
  {
    title: 'Find the distractions',
    description: 'We audit the calls, quotes and follow-ups pulling your attention away from the work.',
    note: 'Free · 15-minute call',
    icon: Search,
    scene: AuditScene,
  },
  {
    title: 'Build the system',
    description: 'We write the messages, connect your tools and set up every follow-up for you.',
    note: 'You approve every message',
    icon: PenLine,
    scene: BuildScene,
  },
  {
    title: 'Focus on the clean',
    description: 'We handle calls, quotes and rebooking while you focus on doing great work.',
    note: 'Runs every day',
    icon: Coffee,
    scene: CleanScene,
  },
];

const PATHWAY_STEPS: PathwayStep[] = STEPS.map((step, index) => ({
  title: step.title,
  text: step.description,
  icon: step.icon,
  note: step.note,
  scene: step.scene,
  eyebrow: `Step ${index + 1}`,
}));

// const LAST = STEPS.length - 1;

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative z-10 w-full overflow-hidden border-t border-ink/[0.06] bg-fade-mist section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading eyebrow="How it works" title="Three steps. You stay focused." />

        <PathwaySteps steps={PATHWAY_STEPS} />

        {/* Previous card layout
        <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            const Scene = step.scene;
            return (
              <li key={step.title} className="relative">
                <FadeUp delay={0.1 + i * 0.12} y={20} className="h-full">
                  <div className="group flex h-full flex-col rounded-3xl border border-ink/[0.08] bg-white p-7 shadow-card transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-card-lg">
                    <div className="-mx-2 -mt-2 h-32 overflow-hidden rounded-2xl bg-gradient-to-b from-accent-soft/70 to-transparent">
                      <Scene />
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-drop bg-accent text-white">
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Step {i + 1}</span>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold tracking-tight text-ink">{step.title}</h3>
                    <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{step.description}</p>

                    <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-ink/70 transition-colors duration-300 group-hover:bg-accent-soft">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {step.note}
                    </span>
                  </div>
                </FadeUp>

                {i < LAST && (
                  <span
                    className="absolute left-1/2 top-full z-10 mt-3 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 rotate-90 items-center justify-center rounded-full border border-ink/10 bg-white text-accent shadow-chip md:left-full md:top-1/2 md:ml-4 md:mt-0 md:rotate-0"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        */}

        <FadeUp delay={0.2} y={16} className="mt-14 flex flex-col items-center gap-5">
          <CtaButton to={AUDIT_PATH}>Run My Audit</CtaButton>
          <TextLink to="/how-it-works" className="text-sm">
            See the full process
          </TextLink>
        </FadeUp>
      </div>
    </section>
  );
}
