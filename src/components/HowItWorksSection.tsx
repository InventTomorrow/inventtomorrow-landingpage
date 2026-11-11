import { Coffee, PenLine, Search } from 'lucide-react';
import { AUDIT_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { FadeUp } from './FadeUp';
import { ProcessSteps, type ProcessStep } from './ProcessSteps';
import { SectionHeading } from './SectionHeading';

const STEPS: ProcessStep[] = [
  {
    title: "We Find What's Costing You Jobs",
    text: 'Free 15 minute audit',
    icon: Search,
  },
  {
    title: "We Fix What's Holding You Back",
    text: 'We handle everything. You stay in control.',
    icon: PenLine,
  },
  {
    title: 'You Focus on Cleaning. We Handle the Rest.',
    text: 'More bookings. Less busywork.',
    icon: Coffee,
  },
];

// The three steps, in the reference's zig-zag layout (see ProcessSteps).
export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative z-10 w-full overflow-hidden bg-hero-soft section-y px-6 sm:px-12">
      <div className="relative mx-auto max-w-6xl">
        <SectionHeading eyebrow="How it works" title="Three Steps." titleMuted="More Jobs. Less Work." />

        <div className="mt-14">
          <ProcessSteps steps={STEPS} perRow={3} />
        </div>

        <FadeUp delay={0.2} y={16} className="mt-14 flex flex-col items-center gap-5">
          <CtaButton to={AUDIT_PATH}>Run My Free Audit</CtaButton>
        </FadeUp>
      </div>
    </section>
  );
}
