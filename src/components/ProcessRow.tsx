import { useRef } from 'react';
import { useHexConnectors } from '../hooks/useHexConnectors';
import { FadeUp } from './FadeUp';
import { HexIcon } from './HexIcon';
import { ProcessStepText } from './ProcessStepText';
import type { ProcessStep } from './ProcessSteps';
import { StepNumber } from './StepNumber';

interface ProcessRowProps {
  steps: ProcessStep[];
  // Number shown on the first step of this row
  firstNumber: number;
  columnsClassName: string;
}

// One row of the zig-zag: even steps keep their hexagon low and their text above, odd steps the other way round.
// The row is as tall as its tallest step. Dotted lines join the hexagons, never touching them or the text.
export function ProcessRow({ steps, firstNumber, columnsClassName }: ProcessRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const hexRefs = useRef<(HTMLElement | null)[]>([]);
  const segments = useHexConnectors(rowRef, hexRefs, steps.length);

  return (
    <div ref={rowRef} className="relative">
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
        {segments.map((segment) => (
          <line key={segment.x1} {...segment} className="stroke-accent" strokeWidth="1.5" strokeDasharray="4 6" strokeLinecap="round" />
        ))}
      </svg>

      <ol className={`relative grid ${columnsClassName}`}>
        {steps.map((step, index) => {
          const isLow = index % 2 === 0;
          const number = <StepNumber number={firstNumber + index} className="text-2xl" />;
          const hex = (
            <HexIcon
              icon={step.icon}
              isSoft
              sizeClassName="w-28"
              ref={(element) => {
                hexRefs.current[index] = element;
              }}
            />
          );
          return (
            <li key={step.title}>
              <FadeUp delay={index * 0.1} y={0} className="flex h-full flex-col items-center text-center">
                {isLow ? (
                  <>
                    {number}
                    <div className="mt-3">
                      <ProcessStepText step={step} isCentered />
                    </div>
                    <div className="mt-auto pt-8">{hex}</div>
                  </>
                ) : (
                  <>
                    <div className="pb-8">{hex}</div>
                    <ProcessStepText step={step} isCentered />
                    <div className="mt-auto pt-5">{number}</div>
                  </>
                )}
              </FadeUp>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
