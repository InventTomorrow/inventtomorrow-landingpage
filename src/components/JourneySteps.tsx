import { ArrowRight, Check } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { JOURNEY_STAGES } from '../content/journey';

const COUNT = JOURNEY_STAGES.length;
const COLUMNS = 3;
const pad = (n: number) => String(n).padStart(2, '0');

// Every stage at once, in order, joined by arrows. One column on phones, two on tablets, three on laptops.
export function JourneySteps() {
  return (
    <ol className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {JOURNEY_STAGES.map((stage, i) => {
        const Icon = stage.icon;
        const isLast = i === COUNT - 1;
        const hasNeighbourOnRight = i % COLUMNS !== COLUMNS - 1;
        return (
          <li key={stage.title} className="relative">
            <FadeUp delay={0.06 + (i % COLUMNS) * 0.1} y={20} className="h-full">
              <article
                aria-label={`Stage ${i + 1} of ${COUNT}: ${stage.title}`}
                className="group flex h-full flex-col rounded-3xl border border-ink/[0.08] bg-white p-7 shadow-card transition-[box-shadow,border-color] duration-500 ease-out hover:border-accent/30 hover:shadow-card-lg sm:p-8"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-drop bg-accent text-white">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    Step {pad(i + 1)} <span className="text-ink/30">/ {pad(COUNT)}</span>
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink">{stage.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{stage.text}</p>

                <ul className="mt-6 space-y-3 border-t border-ink/[0.07] pt-6">
                  {stage.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-sm text-ink">
                      <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            </FadeUp>

            {!isLast && (
              <span
                className="absolute left-1/2 top-full z-10 mt-3 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 rotate-90 items-center justify-center rounded-full border border-ink/10 bg-white text-accent shadow-chip md:hidden"
                aria-hidden="true"
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
            {!isLast && hasNeighbourOnRight && (
              <span
                className="absolute left-full top-1/2 z-10 ml-4 hidden h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ink/10 bg-white text-accent shadow-chip lg:flex"
                aria-hidden="true"
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
