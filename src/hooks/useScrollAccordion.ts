import { RefObject, useCallback, useEffect, useState } from 'react';
import { smoothScrollTo } from '../utils/smoothScroll';
import { getActiveRowIndex, getStackTopForRow, type AccordionMetrics } from '../utils/scrollAccordion';

// Put this attribute on each row's header button; the first one tells the hook how tall a closed row is.
export const ROW_HEADER_ATTRIBUTE = 'data-row-header';

const NAVBAR_CLEARANCE_REM = 6;
// Content inside the stack starts playing once its top edge is this far up the screen
const START_VIEWPORT_FRACTION = 0.75;

type MeasuredMetrics = Omit<AccordionMetrics, 'viewportHeight'>;

function measureStack(stack: HTMLElement, count: number): MeasuredMetrics | null {
  const header = stack.querySelector<HTMLElement>(`[${ROW_HEADER_ATTRIBUTE}]`);
  if (!header) return null;
  const rowHeight = header.offsetHeight;
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  return {
    rowHeight,
    panelHeight: stack.offsetHeight - count * rowHeight,
    topClearance: NAVBAR_CLEARANCE_REM * rootFontSize,
    count,
  };
}

// Opens one row of a fixed-height stack at a time as the page scrolls through it, in either direction.
export function useScrollAccordion(stackRef: RefObject<HTMLElement | null>, count: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;

    let measured = measureStack(stack, count);
    let frame = 0;
    let isStarted = false;

    const update = () => {
      frame = 0;
      if (!measured) return;
      const metrics = { ...measured, viewportHeight: window.innerHeight };
      const stackTop = stack.getBoundingClientRect().top;
      setActiveIndex(getActiveRowIndex(stackTop, metrics));
      if (!isStarted && stackTop < metrics.viewportHeight * START_VIEWPORT_FRACTION) {
        isStarted = true;
        setHasStarted(true);
      }
    };
    const scheduleUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measured = measureStack(stack, count);
      scheduleUpdate();
    };

    update();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', onResize);
    };
  }, [stackRef, count]);

  const scrollToRow = useCallback(
    (index: number) => {
      const stack = stackRef.current;
      const measured = stack && measureStack(stack, count);
      if (!stack || !measured) return;
      const wantedTop = getStackTopForRow(index, { ...measured, viewportHeight: window.innerHeight });
      smoothScrollTo(window.scrollY + stack.getBoundingClientRect().top - wantedTop);
    },
    [stackRef, count],
  );

  return { activeIndex, hasStarted, scrollToRow };
}
