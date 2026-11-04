export interface TimelineMilestone {
  id: string;
  time: string;
  accent: 'blue' | 'coral';
  title?: string;
  description: string;
  durationOffsetMinutes: number;
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: 'incoming-call',
    time: '2:14',
    accent: 'blue',
    description: 'Your phone rings. You keep working.',
    durationOffsetMinutes: 0,
  },
  {
    id: 'instant-reply',
    time: '2:14',
    accent: 'blue',
    description: 'Our system texts the customer back in seconds.',
    durationOffsetMinutes: 0,
  },
  {
    id: 'lead-handled',
    time: '2:20',
    accent: 'coral',
    description: 'The lead is handled without interrupting the clean.',
    durationOffsetMinutes: 6,
  },
];

export function getTimelineProgressPercent(stepIndex: number, totalSteps = 3): number {
  if (totalSteps <= 1) return 100;
  const clamped = Math.max(0, Math.min(stepIndex, totalSteps - 1));
  return Math.round((clamped / (totalSteps - 1)) * 100);
}
