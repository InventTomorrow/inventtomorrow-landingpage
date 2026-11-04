import { useRef } from 'react';
import { FIXES } from '../content/fixes';
import { useScrollStrip } from '../hooks/useScrollStrip';
import { FadeUp } from './FadeUp';
import { RoundArrowButton } from './RoundArrowButton';
import { SectionHeading } from './SectionHeading';
import { WaveLines } from './WaveLines';
import { ServiceCard } from './ServiceCard';
import { ServicesBanner } from './ServicesBanner';

export function ServicesSection() {
  const stripRef = useRef<HTMLUListElement>(null);
  const { canScrollBack, canScrollForward, scrollByCard } = useScrollStrip(stripRef);

  return (
    <section id="services" className="relative z-10 w-full bg-fade-stone section-y px-6 sm:px-12">
      <WaveLines className="-right-16 top-0 h-96 w-[44rem] opacity-70" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Our services"
          title="Seven fixes," titleMuted="built and run for you"
          subtitle="Each one closes a gap between a missed call and a booked clean."
        />

        <FadeUp delay={0.1} y={16} className="mt-14">
          <ul
            ref={stripRef}
            aria-label="Services"
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none]"
          >
            {FIXES.map((fix, index) => (
              <li key={fix.title} className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]">
                <ServiceCard fix={fix} number={index + 1} />
              </li>
            ))}
          </ul>

          <div className="mt-8 flex justify-center gap-4">
            <RoundArrowButton direction="previous" label="Previous services" isDisabled={!canScrollBack} onClick={() => scrollByCard(-1)} />
            <RoundArrowButton direction="next" label="Next services" isDisabled={!canScrollForward} onClick={() => scrollByCard(1)} />
          </div>
        </FadeUp>

        <ServicesBanner />
      </div>
    </section>
  );
}
