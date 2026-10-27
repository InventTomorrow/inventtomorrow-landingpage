import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Eased scrolling for the mouse wheel, trackpad and menu links (touch scrolling stays native).
// Skipped when the visitor's system asks for reduced motion; the page then scrolls normally.
let lenis: Lenis | null = null;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function startSmoothScroll() {
  if (prefersReducedMotion()) return () => {};
  lenis = new Lenis({ autoRaf: true, lerp: 0.1 });
  return () => {
    lenis?.destroy();
    lenis = null;
  };
}

export function smoothScrollTo(target: HTMLElement | number) {
  if (lenis) {
    lenis.scrollTo(target, { duration: 1.2 });
    return;
  }
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (typeof target === 'number') window.scrollTo({ top: target, behavior });
  else target.scrollIntoView({ behavior, block: 'start' });
}

// Freeze the page behind an open menu or dialog.
export function setScrollLocked(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}
