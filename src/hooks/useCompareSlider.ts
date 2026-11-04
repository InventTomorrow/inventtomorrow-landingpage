import { animate, useInView, useReducedMotion, type AnimationPlaybackControls } from 'motion/react';
import { useCallback, useEffect, useRef, type FormEvent } from 'react';

const START_SPLIT = 96;
const REST_SPLIT = 50;

// Drives a before/after slider. The divider position lives in a CSS variable on the frame, so dragging never re-renders React.
// The first time it is on screen it sweeps from "before" to the middle to show what it does, unless the visitor prefers less motion.
export function useCompareSlider() {
  const frameRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sweepRef = useRef<AnimationPlaybackControls | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const isInView = useInView(frameRef, { once: true, amount: 0.6 });

  const setSplit = useCallback((percent: number) => {
    frameRef.current?.style.setProperty('--split', `${percent}%`);
    if (inputRef.current) inputRef.current.value = String(percent);
  }, []);

  useEffect(() => {
    if (!isInView) return;
    if (prefersReducedMotion) {
      setSplit(REST_SPLIT);
      return;
    }
    sweepRef.current = animate(START_SPLIT, REST_SPLIT, { duration: 1.4, ease: [0.65, 0, 0.35, 1], onUpdate: setSplit });
    return () => sweepRef.current?.stop();
  }, [isInView, prefersReducedMotion, setSplit]);

  const stopSweep = () => sweepRef.current?.stop();
  const onInput = (event: FormEvent<HTMLInputElement>) => setSplit(Number(event.currentTarget.value));

  return { frameRef, inputRef, onInput, stopSweep, startSplit: START_SPLIT };
}
