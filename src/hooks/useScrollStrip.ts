import { useCallback, useEffect, useState, type RefObject } from 'react';

// Previous / next controls for a horizontally scrolling strip of equal-width cards.
export function useScrollStrip(stripRef: RefObject<HTMLElement | null>) {
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(true);

  const updateEnds = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    setCanScrollBack(strip.scrollLeft > 1);
    setCanScrollForward(strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1);
  }, [stripRef]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    updateEnds();
    strip.addEventListener('scroll', updateEnds, { passive: true });
    window.addEventListener('resize', updateEnds);
    return () => {
      strip.removeEventListener('scroll', updateEnds);
      window.removeEventListener('resize', updateEnds);
    };
  }, [stripRef, updateEnds]);

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const strip = stripRef.current;
      const firstCard = strip?.firstElementChild as HTMLElement | null;
      if (!strip || !firstCard) return;
      const gap = parseFloat(getComputedStyle(strip).columnGap || '0');
      strip.scrollBy({ left: direction * (firstCard.offsetWidth + gap), behavior: 'smooth' });
    },
    [stripRef],
  );

  return { canScrollBack, canScrollForward, scrollByCard };
}
