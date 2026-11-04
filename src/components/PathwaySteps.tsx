import type { LucideIcon } from 'lucide-react';
import { PathwayRow } from './PathwayRow';

export interface PathwayStep {
  title: string;
  text: string;
  icon: LucideIcon;
  // Small label above the title, e.g. "Step 01 / 06"
  eyebrow: string;
  points?: string[];
}

// Steps as rows split by thin lines, with a dotted line running through their markers.
export function PathwaySteps({ steps }: { steps: PathwayStep[] }) {
  return (
    <ol className="mx-auto mt-14 max-w-5xl border-b border-border">
      {steps.map((step, index) => (
        <PathwayRow key={step.title} step={step} index={index} count={steps.length} />
      ))}
    </ol>
  );
}
