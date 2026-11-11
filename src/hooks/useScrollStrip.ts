import { useCallback, useEffect, useRef, type RefObject } from 'react';

// Pixels per second, independent of the screen's refresh rate.
const DESKTOP_SCROLL_SPEED = 128;
const MOBILE_SCROLL_SPEED = 32;

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
  const navigationRemaining = useRef(0);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !count) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileViewport = window.matchMedia('(max-width: 39.999rem)');
    let loopWidth = 0;
    let position = strip.scrollLeft;
    let isDragging = false;
    let activePointerId: number | null = null;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartPosition = 0;
    let didDrag = false;
    let suppressNextClick = false;
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
      if (loopWidth && isVisible && !document.hidden && !motionPreference.matches && !isDragging) {
        const scrollSpeed = mobileViewport.matches ? MOBILE_SCROLL_SPEED : DESKTOP_SCROLL_SPEED;
        const remaining = navigationRemaining.current;
        const navigationStep = Math.abs(remaining) < 0.1 ? remaining : remaining * (1 - Math.exp(-elapsed / 110));
        navigationRemaining.current -= navigationStep;
        position = wrapPosition(position + elapsed * scrollSpeed / 1000 + navigationStep, loopWidth);
        strip.scrollLeft = position;
      } else {
        position = strip.scrollLeft;
      }
      frame = requestAnimationFrame(tick);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0 || activePointerId !== null) return;
      activePointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartPosition = strip.scrollLeft;
      didDrag = false;
      suppressNextClick = false;
      isDragging = true;
      navigationRemaining.current = 0;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId || !loopWidth) return;
      const distance = event.clientX - dragStartX;
      if (!didDrag) {
        if (Math.abs(distance) < 6 || Math.abs(distance) <= Math.abs(event.clientY - dragStartY)) return;
        didDrag = true;
        strip.setPointerCapture(event.pointerId);
      }
      event.preventDefault();
      position = wrapPosition(dragStartPosition - distance, loopWidth);
      strip.scrollLeft = position;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return;
      if (strip.hasPointerCapture(event.pointerId)) strip.releasePointerCapture(event.pointerId);
      activePointerId = null;
      suppressNextClick = didDrag;
      isDragging = false;
      position = strip.scrollLeft;
    };
    const onClick = (event: MouseEvent) => {
      if (!suppressNextClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressNextClick = false;
    };
    const onDragStart = (event: DragEvent) => { event.preventDefault(); };
    const onWheel = (event: WheelEvent) => {
      if (motionPreference.matches) return;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? strip.clientWidth : 1;
      position += event.deltaX * unit;
    };
    const onScroll = () => {
      // Manual navigation still wraps when automatic motion is disabled.
      if (!motionPreference.matches) return;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (!loopWidth || isDragging) return;
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
    strip.addEventListener('pointermove', onPointerMove);
    strip.addEventListener('pointerdown', onPointerDown);
    strip.addEventListener('click', onClick, true);
    strip.addEventListener('dragstart', onDragStart);
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
      strip.removeEventListener('pointermove', onPointerMove);
      strip.removeEventListener('pointerdown', onPointerDown);
      strip.removeEventListener('click', onClick, true);
      strip.removeEventListener('dragstart', onDragStart);
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
      const gap = parseFloat(getComputedStyle(strip).columnGap || '0');
      const distance = direction * (firstCard.getBoundingClientRect().width + gap);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const loopWidth = getLoopWidth(strip, count);
        if (loopWidth) strip.scrollLeft = wrapPosition(strip.scrollLeft, loopWidth);
        strip.scrollBy({ left: distance, behavior: 'instant' });
      } else {
        navigationRemaining.current += distance;
      }
    },
    [stripRef, count],
  );

  return { scrollByCard };
}
