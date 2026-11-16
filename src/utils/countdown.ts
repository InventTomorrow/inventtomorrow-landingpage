/** The founding offer closes at the end of 15 January 2027, US Eastern (the site's booking time zone). */
export const FOUNDING_CLOSES_AT = Date.parse('2027-01-15T23:59:59-05:00');

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
