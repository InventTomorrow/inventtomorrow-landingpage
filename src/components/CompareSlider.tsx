import { ChevronsLeftRight } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useCompareSlider } from '../hooks/useCompareSlider';

interface CompareSliderProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel: string;
  afterLabel: string;
  ariaLabel: string;
  className?: string;
}

// Two pictures on top of each other; drag the handle (or use the arrow keys) to wipe from "before" to "after".
// The "before" picture sets the size, so both should have the same proportions.
export function CompareSlider({ before, after, beforeLabel, afterLabel, ariaLabel, className = '' }: CompareSliderProps) {
  const { frameRef, inputRef, onInput, stopSweep, startSplit } = useCompareSlider();

  return (
    <div
      ref={frameRef}
      style={{ '--split': `${startSplit}%` } as CSSProperties}
      className={`relative isolate select-none overflow-hidden rounded-3xl has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-accent ${className}`}
    >
      <div>{before}</div>
      <div className="absolute inset-0 [clip-path:inset(0_0_0_var(--split))]" aria-hidden="true">
        {after}
      </div>

      <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-paper px-4 py-1.5 text-sm font-semibold uppercase text-primary">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold uppercase text-on-primary">
        {afterLabel}
      </span>

      <span className="pointer-events-none absolute inset-y-0 left-(--split) w-0.5 -translate-x-1/2 bg-paper" aria-hidden="true">
        <span className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-accent shadow-float">
          <ChevronsLeftRight className="h-5 w-5" />
        </span>
      </span>

      <input
        ref={inputRef}
        type="range"
        min={0}
        max={100}
        defaultValue={startSplit}
        onInput={onInput}
        onPointerDown={stopSweep}
        onKeyDown={stopSweep}
        aria-label={ariaLabel}
        className="absolute inset-0 h-full w-full cursor-ew-resize touch-pan-y opacity-0"
      />
    </div>
  );
}
