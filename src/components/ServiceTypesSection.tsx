import { Building2, Home, KeyRound, Sparkles } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { Stagger } from './Stagger';
import { StaggerItem } from './StaggerItem';
import { ServiceTypeCard } from './ServiceTypeCard';
import { WaveLines } from './WaveLines';

const TYPES = [
  {
    title: 'Residential cleaning',
    image: {
      src: '/images/service-types/residential-cleaning.webp',
      alt: 'A cleaner vacuuming a living room beside a sofa, plants and cleaning tools.',
    },
    text: 'Keep regular customers and new inquiries organized.',
    tags: ['Recurring bookings', 'Appointment reminders', 'Customer preferences'],
    icon: Home,
  },
  {
    title: 'Commercial cleaning',
    image: {
      src: '/images/service-types/commercial-cleaning.webp',
      alt: 'A cleaning team vacuuming, wiping desks and cleaning windows in an office.',
    },
    text: 'Keep client communication and team handoffs consistent.',
    tags: ['Site visit reminders', 'Quote follow-ups', 'Job and client updates'],
    icon: Building2,
  },
  {
    title: 'Move-out and deep cleaning',
    image: {
      src: '/images/service-types/move-out-deep-cleaning.webp',
      alt: 'Cleaners scrubbing floors and wiping surfaces in a room with moving boxes.',
    },
    text: 'Keep time-sensitive inquiries and one-off jobs moving.',
    tags: ['Quote details', 'Booking confirmations', 'Access instructions'],
    icon: KeyRound,
  },
  {
    title: 'Specialist cleaning',
    image: {
      src: '/images/service-types/specialist-cleaning.webp',
      alt: 'A cleaner using specialist equipment to clean a carpet and glass surfaces.',
    },
    text: 'Support the details around carpet, window, upholstery and other specialist jobs.',
    tags: ['Service inquiries', 'Preparation instructions', 'Repeat booking reminders'],
    icon: Sparkles,
  },
];

export function ServiceTypesSection() {
  return (
    <Section bg="stone" id="service-types" width="max-w-7xl" className="overflow-hidden">
      <WaveLines className="-right-24 top-0 -z-10 h-96 w-[44rem] opacity-70" />
      <SectionHeading
        eyebrow="Who it's for"
        title="Built around"
        titleMuted="the services you offer"
        subtitle="The jobs may be different. The need for clear, consistent follow-through is the same."
      />
      <Stagger as="ul" gap={0.1} className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {TYPES.map((type) => (
          <StaggerItem as="li" key={type.title}>
            <ServiceTypeCard {...type} />
          </StaggerItem>
        ))}
      </Stagger>
      <FadeUp delay={0.15} y={12} className="mt-12 text-center">
        <p className="font-display text-lg font-semibold text-primary">
          Your business has its own way of working. <span className="font-normal text-body">Your system should support it.</span>
        </p>
      </FadeUp>
    </Section>
  );
}
