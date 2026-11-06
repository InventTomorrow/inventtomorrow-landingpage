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
  const { scrollByCard } = useScrollStrip(stripRef, FIXES.length);

  return (
    <section id="services" className="relative z-10 w-full bg-fade-stone section-y px-6 sm:px-12">
      <WaveLines className="-right-16 top-0 h-96 w-[44rem] opacity-70" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Our services"
          title="Seven problems" titleMuted="that we solve"
          subtitle="Each one closes a gap between a missed call and a booked clean."
        />

        <FadeUp delay={0.1} y={16} className="mt-14">
          <ul
            id="services-slider"
            ref={stripRef}
            aria-label="Services"
            className="flex gap-6 overflow-x-auto overscroll-x-contain px-1 py-2 [overflow-anchor:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {[0, 1, 2].map((copy) => FIXES.map((fix, index) => (
              <li
                key={`${copy}-${fix.title}`}
                aria-hidden={copy !== 1 || undefined}
                className="w-[85%] shrink-0 sm:w-[calc(50%-0.75rem)] lg:w-[calc(25%-1.125rem)]"
              >
                <ServiceCard fix={fix} number={index + 1} isCopy={copy !== 1} />
              </li>
            )))}
          </ul>

          <div className="mt-6 flex justify-center gap-3" role="group" aria-label="Services navigation">
            <RoundArrowButton direction="previous" label="Previous services" onClick={() => scrollByCard(-1)} />
            <RoundArrowButton direction="next" label="Next services" onClick={() => scrollByCard(1)} />
          </div>
        </FadeUp>

        <ServicesBanner />
      </div>
    </section>
  );
}
