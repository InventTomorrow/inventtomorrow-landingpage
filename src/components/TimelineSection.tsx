import { Clock } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { StayFocusedVisual } from './StayFocusedVisual';
import { WaveLines } from './WaveLines';

const STEPS = [
  { id: 'call', time: '2:14', title: 'Your phone rings.', detail: 'You keep working.' },
  { id: 'text', time: '2:14', title: 'Our system texts the customer back', detail: 'in seconds.' },
  { id: 'handled', time: '2:20', title: 'The lead is handled', detail: 'without interrupting the clean.' },
] as const;

// Two columns: the 2:14 pm story as a timeline on the left, a photo with floating cards on the right.
export function TimelineSection() {
  return (
    <section id="stay-focused" className="relative z-10 w-full overflow-hidden bg-paper section-y px-6 sm:px-12">
      <WaveLines className="-left-24 top-0 h-96 w-[44rem] opacity-70" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading align="left" eyebrow="Stay focused" title="It's 2:14 pm." titleMuted="You're on a job." />

          <ol className="mt-10 flex flex-col gap-8 border-l-2 border-dashed border-accent/40 pl-8">
            {STEPS.map((step, index) => (
              <li key={step.id} className="relative">
                <span className="absolute -left-[2.65rem] top-1 size-5 rounded-full bg-accent ring-4 ring-paper" aria-hidden="true" />
                <FadeUp delay={index * 0.12} y={14}>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {step.time}
                  </span>
                  <p className="mt-2 font-display text-xl font-semibold text-primary">{step.title}</p>
                  <p className="text-base">{step.detail}</p>
                </FadeUp>
              </li>
            ))}
          </ol>

          <FadeUp delay={0.2} y={14}>
            <p className="mt-10 font-display text-xl font-semibold text-primary sm:text-2xl">
              You stay focused. <span className="font-normal text-body">The opportunity keeps moving.</span>
            </p>
          </FadeUp>
        </div>

        <Reveal variant="zoom" delay={0.1}>
          <StayFocusedVisual />
        </Reveal>
      </div>
    </section>
  );
}
