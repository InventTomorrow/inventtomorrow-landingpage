import { useEffect, useRef } from 'react';
import type { ScrollDirection } from '../utils/stagger';

// The way the page last scrolled. A ref, so reading it never re-renders.
export function useScrollDirection() {
  const directionRef = useRef<ScrollDirection>('down');

  useEffect(() => {
    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY === lastScrollY) return;
      directionRef.current = scrollY > lastScrollY ? 'down' : 'up';
      lastScrollY = scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return directionRef;
}
