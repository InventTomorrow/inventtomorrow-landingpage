import type { LucideIcon } from 'lucide-react';
import { chunk } from '../utils/chunk';
import { FadeUp } from './FadeUp';
import { HexIcon } from './HexIcon';
import { ProcessRow } from './ProcessRow';
import { ProcessStepText } from './ProcessStepText';
import { StepNumber } from './StepNumber';

export interface ProcessStep {
  title: string;
  text: string;
  icon: LucideIcon;
  note?: string;
  points?: string[];
}

interface ProcessStepsProps {
  steps: ProcessStep[];
  // Steps per row from large screens up. More steps wrap onto the next row.
  perRow?: 3 | 4;
}

const ROW_COLUMNS = { 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' } as const;

// Steps in the reference's zig-zag: hexagon icons joined by dotted lines, a number tab and the text beside each.
// Phones show a simple list instead.
export function ProcessSteps({ steps, perRow = 4 }: ProcessStepsProps) {
  return (
    <div>
      <ol className="flex flex-col gap-10 lg:hidden">
        {steps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-5">
            <HexIcon icon={step.icon} isSoft sizeClassName="w-20" />
            <FadeUp y={14} className="flex-1">
              <StepNumber number={index + 1} className="mb-3 text-xl" />
              <ProcessStepText step={step} />
            </FadeUp>
          </li>
        ))}
      </ol>

      <div className="hidden flex-col gap-14 lg:flex">
        {chunk(steps, perRow).map((rowSteps, rowIndex) => (
          <ProcessRow key={rowSteps[0].title} steps={rowSteps} firstNumber={rowIndex * perRow + 1} columnsClassName={ROW_COLUMNS[perRow]} />
        ))}
      </div>
    </div>
  );
}
