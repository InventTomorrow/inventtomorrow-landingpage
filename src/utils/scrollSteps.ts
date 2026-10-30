const clampProgress = (progress: number) => Math.min(Math.max(progress, 0), 1);

// Which step is showing when the section has been scrolled `progress` (0 to 1) of the way through.
export function getStepIndexFromProgress(progress: number, count: number): number {
  if (count <= 1) return 0;
  return Math.min(Math.floor(clampProgress(progress) * count), count - 1);
}

// 0 to 1 across the stretch of scroll that belongs to the current step.
export function getStepProgress(progress: number, count: number): number {
  const clamped = clampProgress(progress);
  if (clamped >= 1) return 1;
  const scaled = clamped * count;
  return scaled - Math.floor(scaled);
}

// Where the middle of a step sits in the scroll range, for jumping straight to it.
export function getProgressAtStepCenter(index: number, count: number): number {
  return (index + 0.5) / count;
}
