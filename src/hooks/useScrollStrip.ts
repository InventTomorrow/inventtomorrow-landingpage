import { useCallback, useEffect, useRef, type RefObject } from 'react';

const SCROLL_SPEED = 32; // Pixels per second, independent of the screen's refresh rate.
const INTERACTION_PAUSE_MS = 1800;

// Render three copies of the cards. Staying in the middle copy lets either direction wrap invisibly.
function getLoopWidth(strip: HTMLElement, count: number) {
  const first = strip.children[0] as HTMLElement | undefined;
  const nextCopy = strip.children[count] as HTMLElement | undefined;
  return first && nextCopy ? nextCopy.offsetLeft - first.offsetLeft : 0;
}

function wrapPosition(position: number, width: number) {
  return width + ((position % width) + width) % width;
}

export function useScrollStrip(stripRef: RefObject<HTMLElement | null>, count: number) {
  const pauseUntil = useRef(0);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !count) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let loopWidth = 0;
    let position = strip.scrollLeft;
    let isHovered = strip.matches(':hover');
    let isFocused = strip.contains(document.activeElement);
    let isDragging = false;
    let isVisible = false;
    let frame = 0;
    let settleTimer = 0;
    let lastTime = performance.now();

    const measure = () => {
      const nextWidth = getLoopWidth(strip, count);
      if (!nextWidth) return;
      const progress = loopWidth ? (strip.scrollLeft % loopWidth) / loopWidth : (strip.scrollLeft % nextWidth) / nextWidth;
      loopWidth = nextWidth;
      position = loopWidth * (1 + progress);
      strip.scrollLeft = position;
    };

    const tick = (now: number) => {
      const elapsed = Math.min(now - lastTime, 64);
      lastTime = now;
      if (loopWidth && isVisible && !document.hidden && !motionPreference.matches && !isHovered && !isFocused && !isDragging && now >= pauseUntil.current) {
        position = wrapPosition(position + elapsed * SCROLL_SPEED / 1000, loopWidth);
        strip.scrollLeft = position;
      } else {
        position = strip.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };

    const onPointerEnter = (event: PointerEvent) => { if (event.pointerType !== 'touch') isHovered = true; };
    const onPointerLeave = () => { isHovered = false; };
    const onFocusIn = () => { isFocused = true; };
    const onFocusOut = (event: FocusEvent) => { isFocused = event.relatedTarget instanceof Node && strip.contains(event.relatedTarget); };
    const onPointerDown = () => { isDragging = true; };
    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      pauseUntil.current = performance.now() + INTERACTION_PAUSE_MS;
    };
    const onWheel = () => { pauseUntil.current = performance.now() + INTERACTION_PAUSE_MS; };
    const onScroll = () => {
      // Allow native swipes and smooth arrow navigation to finish before recentering the loop.
      if (!motionPreference.matches && performance.now() >= pauseUntil.current) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (!loopWidth || isDragging || isFocused) return;
        position = wrapPosition(strip.scrollLeft, loopWidth);
        if (Math.abs(strip.scrollLeft - position) > 1) strip.scrollLeft = position;
      }, 180);
    };

    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(strip);
    if (strip.firstElementChild) resizeObserver.observe(strip.firstElementChild);
    const visibilityObserver = new IntersectionObserver(([entry]) => { isVisible = entry.isIntersecting; });
    visibilityObserver.observe(strip);
    strip.addEventListener('pointerenter', onPointerEnter);
    strip.addEventListener('pointerleave', onPointerLeave);
    strip.addEventListener('focusin', onFocusIn);
    strip.addEventListener('focusout', onFocusOut);
    strip.addEventListener('pointerdown', onPointerDown);
    strip.addEventListener('wheel', onWheel, { passive: true });
    strip.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settleTimer);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      strip.removeEventListener('pointerenter', onPointerEnter);
      strip.removeEventListener('pointerleave', onPointerLeave);
      strip.removeEventListener('focusin', onFocusIn);
      strip.removeEventListener('focusout', onFocusOut);
      strip.removeEventListener('pointerdown', onPointerDown);
      strip.removeEventListener('wheel', onWheel);
      strip.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [stripRef, count]);

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const strip = stripRef.current;
      const firstCard = strip?.firstElementChild as HTMLElement | null;
      if (!strip || !firstCard) return;
      pauseUntil.current = performance.now() + INTERACTION_PAUSE_MS;
      const loopWidth = getLoopWidth(strip, count);
      if (loopWidth) strip.scrollLeft = wrapPosition(strip.scrollLeft, loopWidth);
      const gap = parseFloat(getComputedStyle(strip).columnGap || '0');
      const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
      strip.scrollBy({ left: direction * (firstCard.getBoundingClientRect().width + gap), behavior });
    },
    [stripRef, count],
  );

  return { scrollByCard };
}
