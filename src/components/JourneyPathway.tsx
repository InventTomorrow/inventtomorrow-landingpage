import { PathwaySteps, type PathwayStep } from './PathwaySteps';
import { JOURNEY_STAGES } from '../content/journey';

const pad = (n: number) => String(n).padStart(2, '0');

const STEPS: PathwayStep[] = JOURNEY_STAGES.map((stage, index) => ({
  title: stage.title,
  text: stage.text,
  icon: stage.icon,
  points: stage.points,
  eyebrow: `Step ${pad(index + 1)} / ${pad(JOURNEY_STAGES.length)}`,
}));

// From inquiry to repeat business, as a road with a stop at every stage.
export function JourneyPathway() {
  return <PathwaySteps steps={STEPS} />;
}
