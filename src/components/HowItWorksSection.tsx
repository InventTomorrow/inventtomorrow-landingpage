import { Coffee, PenLine, Search } from 'lucide-react';
import { AUDIT_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { FadeUp } from './FadeUp';
import { ProcessSteps, type ProcessStep } from './ProcessSteps';
import { SectionHeading } from './SectionHeading';
import { WaveLines } from './WaveLines';
import { TextLink } from './TextLink';

const STEPS: ProcessStep[] = [
  {
    title: 'Find the distractions',
    text: 'We audit the calls, quotes and follow-ups pulling your attention away from the work.',
    note: 'Free · 15-minute call',
    icon: Search,
  },
  {
    title: 'Build the system',
    text: 'We write the messages, connect your tools and set up every follow-up for you.',
    note: 'You approve every message',
    icon: PenLine,
  },
  {
    title: 'Focus on the clean',
    text: 'We handle calls, quotes and rebooking while you focus on doing great work.',
    note: 'Runs every day',
    icon: Coffee,
  },
];

// The three steps, in the reference's zig-zag layout (see ProcessSteps).
export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative z-10 w-full overflow-hidden bg-hero-soft section-y px-6 sm:px-12">
      <WaveLines className="-left-16 bottom-0 h-80 w-[40rem] opacity-70" />
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading eyebrow="How it works" title="Three steps." titleMuted="You stay focused." />

        <div className="mt-14">
          <ProcessSteps steps={STEPS} perRow={3} />
        </div>

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
