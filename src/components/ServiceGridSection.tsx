import { FIXES } from '../content/fixes';
import { FadeUp } from './FadeUp';
import { Section } from './Section';
import { SectionHeading } from './SectionHeading';
import { ServiceDetailCard } from './ServiceDetailCard';

// The seven fixes as a two-column grid of wide cards. A lone last card sits in the middle.
export function ServiceGridSection() {
  return (
    <Section bg="paper" id="service-list" width="max-w-7xl">
      <SectionHeading
        eyebrow="What we set up"
        title="Seven fixes," titleMuted="each doing one job well"
        subtitle="We build them, write the messages and run them for you."
      />
      <ul className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {FIXES.map((fix, index) => (
          <li key={fix.title} className="lg:last:odd:col-span-2 lg:last:odd:mx-auto lg:last:odd:w-[calc(50%-0.75rem)]">
            <FadeUp delay={(index % 2) * 0.08} y={18} className="h-full">
              <ServiceDetailCard fix={fix} />
            </FadeUp>
          </li>
        ))}
      </ul>
    </Section>
  );
}
