import { JOURNEY_STAGES } from '../content/journey';
import { ProcessSteps, type ProcessStep } from './ProcessSteps';

const STEPS: ProcessStep[] = JOURNEY_STAGES.map(({ title, text, points, icon }) => ({ title, text, points, icon }));

// From inquiry to repeat business, as zig-zag steps (three to a row).
export function JourneyPathway() {
  return (
    <div className="mt-14">
      <ProcessSteps steps={STEPS} perRow={3} />
    </div>
  );
}
