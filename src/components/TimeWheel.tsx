import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { appointmentTimeLabel } from '../utils/appointmentPicker';
import styles from './AppointmentPicker.module.css';

/** Row height in rem; must match --wheel-row in AppointmentPicker.module.css. */
const ROW_REM = 2.75;

/**
 * Phone time picker: a vertical wheel like the iOS alarm clock. Drag up or down and the
 * time that settles under the highlight band is the chosen one; the button confirms it.
 */
export function TimeWheel({ times, initial, onConfirm }: {
  times: string[];
  initial: string;
  onConfirm: (time: string) => void;
}) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const rowPx = () => ROW_REM * parseFloat(getComputedStyle(document.documentElement).fontSize || '16');
  const startIndex = Math.max(0, times.indexOf(initial));
  const [index, setIndex] = useState(startIndex);
  const active = times[Math.min(index, times.length - 1)];

  // Start with the suggested time already under the band.
  useEffect(() => {
    const wheel = wheelRef.current;
    if (!wheel) return;
    wheel.scrollTop = startIndex * rowPx();
    wheel.focus({ preventScroll: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const goTo = (next: number, smooth = true) => {
    const clamped = Math.min(times.length - 1, Math.max(0, next));
    setIndex(clamped);
    wheelRef.current?.scrollTo({ top: clamped * rowPx(), behavior: smooth ? 'smooth' : 'auto' });
  };

  const onScroll = () => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const wheel = wheelRef.current;
      if (!wheel) return;
      setIndex(Math.min(times.length - 1, Math.max(0, Math.round(wheel.scrollTop / rowPx()))));
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') goTo(index + 1);
    else if (event.key === 'ArrowUp') goTo(index - 1);
    else if (event.key === 'Home') goTo(0);
    else if (event.key === 'End') goTo(times.length - 1);
    else if (event.key === 'PageDown') goTo(index + 4);
    else if (event.key === 'PageUp') goTo(index - 4);
    else if (event.key === 'Enter' && active) onConfirm(active);
    else return;
    event.preventDefault();
  };

  return (
    <div className={styles.wheelWrap}>
      <div className={styles.wheelBand} aria-hidden="true" />
      <div
        ref={wheelRef}
        className={styles.wheel}
        role="listbox"
        tabIndex={0}
        aria-label="Preferred appointment time. Use the up and down arrow keys to change it."
        aria-activedescendant={active ? `wheel-${active.replace(':', '')}` : undefined}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
      >
        {times.map((time, i) => (
          <div
            key={time}
            id={`wheel-${time.replace(':', '')}`}
            role="option"
            aria-selected={i === index}
            data-active={i === index}
            data-distance={Math.min(Math.abs(i - index), 3)}
            className={styles.wheelItem}
            onClick={() => goTo(i)}
          >{appointmentTimeLabel(time)}</div>
        ))}
      </div>
      <button type="button" className={styles.confirm} onClick={() => active && onConfirm(active)}>
        {active ? `Confirm ${appointmentTimeLabel(active)}` : 'Confirm'}
      </button>
    </div>
  );
}
