/** The founding offer closes at the end of 1 December 2026, US Eastern (the site's booking time zone). Temporarily hardcoded to 13 days out from 18 Nov 2026. */
export const FOUNDING_CLOSES_AT = Date.parse('2026-12-01T23:59:59-05:00');

/**
 * Close time to count down to. Production always uses the real FOUNDING_CLOSES_AT.
 * Only a non-production build may pass `testDays` (from VITE_COUNTDOWN_TEST_DAYS) to preview a
 * fixed-length countdown that restarts on each page load; `now` is when the page mounted.
 */
export function closesAt(now: number, testDays?: number): number {
  if (!testDays || !Number.isFinite(testDays) || testDays <= 0) return FOUNDING_CLOSES_AT;
  return now + testDays * 86_400_000 + 999;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/** Time remaining until `target`, or null once it has passed. */
export function timeLeft(target: number, now: number): TimeLeft | null {
  const total = Math.floor((target - now) / 1000);
  if (!Number.isFinite(total) || total <= 0) return null;
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}
