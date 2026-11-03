import { RefObject, useEffect, useState } from 'react';
import type { ScrollDirection } from '../utils/stagger';
import { useScrollDirection } from './useScrollDirection';

interface DirectionalReveal {
  isVisible: boolean;
  // The way the page was scrolling when the element last became visible or hid
  direction: ScrollDirection;
}

// Tells whether an element is on screen and which way the page was moving when that changed, so its
// children can enter and leave in the scroll direction, every time. It shows once `threshold` of the
// element is visible and hides only after the element has fully left the screen.
export function useDirectionalReveal(ref: RefObject<HTMLElement | null>, threshold = 0.25): DirectionalReveal {
  const directionRef = useScrollDirection();
  const [reveal, setReveal] = useState<DirectionalReveal>({ isVisible: false, direction: 'down' });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        // `isIntersecting` is true for a single visible pixel, so the amount is checked by hand.
        const isEnoughVisible = entry.intersectionRatio >= threshold;
        setReveal((current) => {
          const isVisible = isEnoughVisible || (entry.isIntersecting && current.isVisible);
          return isVisible === current.isVisible ? current : { isVisible, direction: directionRef.current };
        });
      },
      { threshold },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, directionRef, threshold]);

  return reveal;
}
