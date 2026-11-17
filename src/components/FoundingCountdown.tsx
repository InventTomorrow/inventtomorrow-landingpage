import { useEffect, useState } from 'react';
import { closesAt, FOUNDING_CLOSES_AT, timeLeft } from '../utils/countdown';

const HARDCODED_DAYS = 13;

const pad =(value: number) => String(value).padStart(2, '0');

/**
 * Live countdown to the real close date of the founding offer. Renders nothing after it closes.
 * The prerendered HTML can't know the time, so until mounted it holds the countdown's exact space
 * (placeholder digits) and hydration matches; the live numbers then swap in without moving the page.
 */
export function FoundingCountdown({ variant = 'boxes', className = '' }: { variant?: 'boxes' | 'inline'; className?: string }) {
  const [now, setNow] = useState<number | null>(null);
  const [target, setTarget] = useState(FOUNDING_CLOSES_AT);

  useEffect(() => {
    const mountedAt = Date.now();
    // TEMPORARY: hardcoded to 13 days from page load (restarts on each load) in all builds.
    setTarget(closesAt(mountedAt, HARDCODED_DAYS));
    setNow(mountedAt);
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isMounted = now !== null;
  const left = isMounted ? timeLeft(target, now) : null;
  if (isMounted && !left) return null;

  if (variant === 'inline') {
    if (!left) {
      return <p aria-hidden="true" className={`${className} invisible`}>Closes in <strong className="tabular-nums">00d 00h 00m 00s</strong></p>;
    }
    return (
      <p role="timer" className={className}>
        Closes in <strong className="tabular-nums">{left.days}d {pad(left.hours)}h {pad(left.minutes)}m {pad(left.seconds)}s</strong>
      </p>
    );
  }

  const parts = [
    ['Days', left?.days],
    ['Hours', left?.hours],
    ['Mins', left?.minutes],
    ['Secs', left?.seconds],
  ] as const;
  return (
    <div
      role={left ? 'timer' : undefined}
      aria-label={left ? `Founding offer closes in ${left.days} days, ${left.hours} hours and ${left.minutes} minutes` : undefined}
      aria-hidden={left ? undefined : true}
      className={className}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-primary/70">Founding spots close in</p>
      <div className="mt-2 grid grid-cols-4 gap-2">
        {parts.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-paper px-1 py-2.5 text-center shadow-sm" aria-hidden="true">
            <span className="block font-display text-2xl font-semibold leading-none tabular-nums text-primary sm:text-3xl">{value === undefined ? '--' : label === 'Days' ? value : pad(value)}</span>
            <span className="mt-1.5 block text-[0.6875rem] font-semibold uppercase tracking-wide text-ink">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
