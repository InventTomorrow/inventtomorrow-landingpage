import { useLayoutEffect, useState, type RefObject } from 'react';
import { getConnectorSegments, type Connector } from '../utils/processConnectors';

// Measures where each hexagon sits inside the row and returns the dotted segments between them, in px.
// Re-measures whenever the row changes size and once the fonts have loaded.
export function useHexConnectors(rowRef: RefObject<HTMLElement | null>, hexRefs: RefObject<(HTMLElement | null)[]>, count: number) {
  const [segments, setSegments] = useState<Connector[]>([]);

  useLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const measure = () => {
      const rowBox = row.getBoundingClientRect();
      const centres = hexRefs.current
        .slice(0, count)
        .filter((hex): hex is HTMLElement => hex !== null)
        .map((hex) => {
          const box = hex.getBoundingClientRect();
          return { x: box.left - rowBox.left + box.width / 2, y: box.top - rowBox.top + box.height / 2 };
        });
      setSegments(getConnectorSegments(centres));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [rowRef, hexRefs, count]);

  return segments;
}
