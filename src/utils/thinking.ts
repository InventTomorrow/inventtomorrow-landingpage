// What Invo shows while a reply is on its way. The pacing follows the real wait:
// a reply that is already here flashes through the remaining stages, and a slow one
// keeps moving, so the indicator never claims more time than the work took.
export const THINKING_STEPS = ['Reading', 'Understanding', 'Thinking', 'Typing'] as const;
const LABELS = ['Reading your message', 'Understanding what you need', 'Thinking it through', 'Typing your answer'] as const;

export const DEFAULT_EXPECTED_MS = 2500;
export const MIN_READING_MS = 250; // long enough to read the first label
export const FAST_STAGE_MS = 120; // each remaining stage when the reply is already here
// A reply that took at least this long needs no extra show: it appears the moment it arrives.
export const NO_EXTRA_WAIT_MS = 700;
export const QUICK_TYPING_MS = 200; // the last beat before a very quick reply appears

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const stageLabel = (step: number) => LABELS[clamp(step, 0, 3)];

// Faster typical replies move through the first stages sooner.
export function stageThresholds(expectedMs: number): [number, number] {
  return [clamp(expectedMs * 0.12, MIN_READING_MS, 700), clamp(expectedMs * 0.35, 900, 1800)];
}

export function thinkingStage(elapsedMs: number, replyReady: boolean, expectedMs = DEFAULT_EXPECTED_MS): { step: number; label: string } {
  if (replyReady) return { step: 3, label: LABELS[3] };
  const [reading, understanding] = stageThresholds(expectedMs);
  if (elapsedMs < reading) return { step: 0, label: LABELS[0] };
  if (elapsedMs < understanding) return { step: 1, label: LABELS[1] };
  if (elapsedMs < 5000) return { step: 2, label: LABELS[2] };
  if (elapsedMs < 10_000) return { step: 2, label: 'Checking the details' };
  return { step: 2, label: 'Almost there' };
}

// A running average of how long replies really take, so the next wait is paced to it.
export const nextExpectedMs = (previous: number, actualMs: number) =>
  Math.round(previous * 0.6 + clamp(actualMs, 300, 15_000) * 0.4);

// Once the reply has arrived (elapsedMs after sending). A visitor who already waited gets the reply at
// once; only a near-instant reply (a canned answer) is held for a short beat so the stages are not a flash.
export function revealPlan(elapsedMs: number, expectedMs = DEFAULT_EXPECTED_MS) {
  if (elapsedMs >= NO_EXTRA_WAIT_MS) return { readingWaitMs: 0, steps: [] as number[], stageMs: 0, typingMs: 0 };
  const current = thinkingStage(elapsedMs, false, expectedMs).step;
  const steps: number[] = [];
  for (let step = current + 1; step <= 2; step++) steps.push(step);
  return { readingWaitMs: Math.max(0, MIN_READING_MS - elapsedMs), steps, stageMs: FAST_STAGE_MS, typingMs: QUICK_TYPING_MS };
}
