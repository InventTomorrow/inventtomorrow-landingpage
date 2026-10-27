export interface TimelineMilestone {
  id: string;
  time: string;
  accent: 'blue' | 'coral';
  title?: string;
  description: string;
  dotColor: string;
  glowColor: string;
  durationOffsetMinutes: number;
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    id: 'incoming-call',
    time: '2:14',
    accent: 'blue',
    description: 'Your phone rings. You keep working.',
    dotColor: '#60a5fa',
    glowColor: 'rgba(96, 165, 250, 0.6)',
    durationOffsetMinutes: 0,
  },
  {
    id: 'instant-reply',
    time: '2:14',
    accent: 'blue',
    description: 'Our system texts the customer back in seconds.',
    dotColor: '#818cf8',
    glowColor: 'rgba(129, 140, 248, 0.6)',
    durationOffsetMinutes: 0,
  },
  {
    id: 'lead-handled',
    time: '2:20',
    accent: 'coral',
    description: 'The lead is handled without interrupting the clean.',
    dotColor: '#fb7185',
    glowColor: 'rgba(251, 113, 133, 0.6)',
    durationOffsetMinutes: 6,
  },
];

export function getTimelineProgressPercent(stepIndex: number, totalSteps = 3): number {
  if (totalSteps <= 1) return 100;
  const clamped = Math.max(0, Math.min(stepIndex, totalSteps - 1));
  return Math.round((clamped / (totalSteps - 1)) * 100);
}
