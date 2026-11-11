import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

// Eased scrolling for the mouse wheel, trackpad and menu links (touch scrolling stays native).
// Skipped when the visitor's system asks for reduced motion; the page then scrolls normally.
let lenis: Lenis | null = null;
let savedOverflow: { root: string; body: string } | null = null;

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
    const offset = typeof target === 'number' ? 0 : -(document.querySelector('header')?.getBoundingClientRect().height ?? 0) - 16;
    lenis.scrollTo(target, { duration: 1.2, offset });
    return;
  }
  const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
  if (typeof target === 'number') window.scrollTo({ top: target, behavior });
  else target.scrollIntoView({ behavior, block: 'start' });
}

// Instant jump, no easing (used when a new page opens).
export function jumpTo(top: number) {
  if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
  else window.scrollTo(0, top);
}

// Freeze the page behind an open menu or dialog.
export function setScrollLocked(locked: boolean) {
  if (locked) {
    if (!savedOverflow) {
      savedOverflow = { root: document.documentElement.style.overflow, body: document.body.style.overflow };
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    }
    lenis?.stop();
  } else {
    if (savedOverflow) {
      document.documentElement.style.overflow = savedOverflow.root;
      document.body.style.overflow = savedOverflow.body;
      savedOverflow = null;
    }
    lenis?.start();
  }
}
