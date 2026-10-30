import { useLayoutEffect, useRef, useState } from 'react';
import type { Point } from '../utils/zigzagPath';

interface StepPathLayout {
  points: Point[];
  width: number;
  height: number;
}

const EMPTY_LAYOUT: StepPathLayout = { points: [], width: 0, height: 0 };

// Finds the centre of each step marker inside the list, and again whenever the list changes size.
export function useStepPath(count: number) {
  const containerRef = useRef<HTMLOListElement>(null);
  const markerRefs = useRef<(HTMLElement | null)[]>([]);
  const [layout, setLayout] = useState<StepPathLayout>(EMPTY_LAYOUT);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const box = container.getBoundingClientRect();
      const markers = markerRefs.current.slice(0, count);
      if (markers.some((marker) => !marker)) return;
      const points = markers.map((marker) => {
        const markerBox = (marker as HTMLElement).getBoundingClientRect();
        return { x: markerBox.left - box.left + markerBox.width / 2, y: markerBox.top - box.top + markerBox.height / 2 };
      });
      setLayout({ points, width: box.width, height: box.height });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [count]);

  return { containerRef, markerRefs, layout };
}
