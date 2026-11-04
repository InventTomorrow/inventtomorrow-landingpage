import { Check } from 'lucide-react';
import type { ProcessStep } from './ProcessSteps';

// A step's title, text and either a short note or a checklist.
export function ProcessStepText({ step, isCentered = false }: { step: ProcessStep; isCentered?: boolean }) {
  return (
    <div className={`max-w-[14rem] ${isCentered ? 'mx-auto text-center' : ''}`}>
      <h3 className="text-lg font-semibold leading-snug text-primary">{step.title}</h3>
      <p className="mt-1.5 text-sm leading-6">{step.text}</p>
      {step.note && <p className="mt-2 text-sm font-medium text-accent">{step.note}</p>}
      {step.points && (
        <ul className={`mt-3 space-y-1.5 text-left text-sm leading-5 text-primary ${isCentered ? 'mx-auto w-fit' : ''}`}>
          {step.points.map((point) => (
            <li key={point} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
              {point}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
