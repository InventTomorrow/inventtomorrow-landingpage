import { useEffect, useState } from 'react';

// Steps through 0..count-1 on a timer. A manual change restarts the wait, and nothing moves while paused.
export function useAutoCycle(count: number, intervalMs: number, isPaused: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setTimeout(() => setIndex((current) => (current + 1) % count), intervalMs);
    return () => window.clearTimeout(timer);
  }, [index, count, intervalMs, isPaused]);

  return [index, setIndex] as const;
}
