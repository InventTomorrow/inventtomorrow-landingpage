import { Home, Building2, KeyRound, Sparkles } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { HoverCard } from './HoverCard';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { CleanScene } from './illustrations/processScenes';

const TYPES = [
  {
    title: 'Residential cleaning',
    text: 'Keep regular customers and new inquiries organized.',
    tags: ['Recurring bookings', 'Appointment reminders', 'Customer preferences'],
    icon: Home,
  },
  {
    title: 'Commercial cleaning',
    text: 'Keep client communication and team handoffs consistent.',
    tags: ['Site visit reminders', 'Quote follow-ups', 'Job and client updates'],
    icon: Building2,
  },
  {
    title: 'Move-out and deep cleaning',
    text: 'Keep time-sensitive inquiries and one-off jobs moving.',
    tags: ['Quote details', 'Booking confirmations', 'Access instructions'],
    icon: KeyRound,
  },
  {
    title: 'Specialist cleaning',
    text: 'Support the details around carpet, window, upholstery and other specialist jobs.',
    tags: ['Service inquiries', 'Preparation instructions', 'Repeat booking reminders'],
    icon: Sparkles,
  },
];

// Divider lines between the cells of the 2-column grid (1 column on phones), with none on the outer edges.
function getDividerClasses(index: number, count: number): string {
  const isLastRow = index >= count - 2;
  return [
    index < count - 1 ? 'border-b' : '',
    isLastRow ? 'md:border-b-0' : 'md:border-b',
    index % 2 === 0 ? 'md:border-r' : '',
    'border-ink/10 hover:border-navy',
  ].join(' ');
}

export function ServiceTypesSection() {
  return (
    <Section bg="paper" id="service-types" width="max-w-5xl">
      <SectionHeading
        scene={CleanScene}
        title="Built around the services you offer"
        subtitle="The jobs may be different. The need for clear, consistent follow-through is the same."
      />
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2">
        {TYPES.map((type, i) => (
          <HoverCard
            key={type.title}
            variant="plain"
            className={getDividerClasses(i, TYPES.length)}
            icon={type.icon}
            title={type.title}
            text={type.text}
            tags={type.tags}
            delay={0.08 + i * 0.07}
          />
        ))}
      </div>
      <FadeUp delay={0.15} y={12} className="mt-12 text-center">
        <p className="text-lg font-semibold tracking-tight text-ink">
          Your business has its own way of working. <span className="text-muted font-normal">Your system should support it.</span>
        </p>
      </FadeUp>
    </Section>
  );
}
