// One pointer listener for the whole page. It tells the card under the cursor where the cursor is,
// so the grey hover light (.spotlight in index.css) can follow it. Runs at most once per frame.
export function startSpotlight() {
  if (!window.matchMedia('(hover: hover)').matches) return () => {};

  let frame = 0;
  let last: PointerEvent | null = null;

  const update = () => {
    frame = 0;
    const card = last && (last.target as Element | null)?.closest?.<HTMLElement>('.spotlight');
    if (!last || !card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--spot-x', `${last.clientX - rect.left}px`);
    card.style.setProperty('--spot-y', `${last.clientY - rect.top}px`);
  };

  const onMove = (e: PointerEvent) => {
    last = e;
    if (!frame) frame = requestAnimationFrame(update);
  };

  window.addEventListener('pointermove', onMove, { passive: true });
  return () => {
    window.removeEventListener('pointermove', onMove);
    cancelAnimationFrame(frame);
  };
}
