import { useEffect, useRef, useState } from 'react';

// Reveals `text` at the requested pace, in sync with browser frames, and calls `onDone` when finished.
// Visitors who ask for reduced motion get the whole text at once.
export function useTypewriter(text: string, start: boolean, msPerChar: number, onDone?: () => void) {
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    if (!start) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(text.length);
      onDoneRef.current?.();
      return;
    }
    const startedAt = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const typed = Math.min(text.length, Math.floor((now - startedAt) / msPerChar));
      setCount(typed);
      if (typed >= text.length) {
        onDoneRef.current?.();
        return;
      }
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [start, text, msPerChar]);

  return count;
}
