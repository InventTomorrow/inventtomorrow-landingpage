import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { motion } from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { JOURNEY_STAGES as STAGES } from '../content/journey';

const COUNT = STAGES.length;
const pad = (n: number) => String(n).padStart(2, '0');

// Horizontal strip of stage cards: the next card peeks in from the right. Move with the arrow
// buttons, the keyboard, a swipe, or by dragging with the mouse.
export function JourneyCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; scroll: number; moved: boolean } | null>(null);

  const step = () => {
    const track = trackRef.current;
    const first = track?.children[0] as HTMLElement | undefined;
    if (!track || !first) return 1;
    return first.offsetWidth + parseFloat(getComputedStyle(track).columnGap || '0');
  };

  const goTo = (i: number) => {
    const target = Math.max(0, Math.min(COUNT - 1, i));
    trackRef.current?.scrollTo({ left: target * step(), behavior: 'smooth' });
  };

  // Keep the counter and progress bar in sync with wherever the strip has scrolled to.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => setIndex(Math.max(0, Math.min(COUNT - 1, Math.round(track.scrollLeft / step()))));
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, []);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  // Mouse drag (touch already scrolls natively). Snapping is paused while dragging.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !trackRef.current) return;
    drag.current = { x: e.clientX, scroll: trackRef.current.scrollLeft, moved: false };
    trackRef.current.style.scrollSnapType = 'none';
    trackRef.current.style.scrollBehavior = 'auto';
    trackRef.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current || !trackRef.current) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    trackRef.current.scrollLeft = drag.current.scroll - dx;
  };
  const endDrag = () => {
    const track = trackRef.current;
    if (!drag.current || !track) return;
    drag.current = null;
    const nearest = Math.round(track.scrollLeft / step());
    track.style.scrollBehavior = '';
    track.scrollTo({ left: Math.max(0, Math.min(COUNT - 1, nearest)) * step(), behavior: 'smooth' });
    // Turn snapping back on once the glide has settled.
    window.setTimeout(() => {
      track.style.scrollSnapType = '';
    }, 450);
  };

  return (
    <div>
      <div
        ref={trackRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="From inquiry to repeat business"
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth scroll-px-6 px-6 pb-4 pt-2 [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue sm:-mx-12 sm:scroll-px-12 sm:px-12 lg:mx-0 lg:scroll-px-0 lg:px-0 cursor-grab active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
      >
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          return (
            <article
              key={stage.title}
              aria-label={`Stage ${i + 1} of ${COUNT}: ${stage.title}`}
              className={`spotlight flex w-[86.5%] shrink-0 snap-start flex-col rounded-3xl border bg-white p-7 transition-[border-color,box-shadow,opacity] duration-300 sm:p-8 md:w-[68%] lg:w-[38.5%] ${
                i === index
                  ? 'border-ink/10 shadow-card'
                  : 'border-ink/[0.07] opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-drop bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold tabular-nums text-ink/35">
                  {pad(i + 1)} / {pad(COUNT)}
                </span>
              </div>
              <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink">{stage.title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{stage.text}</p>
              <ul className="mt-6 space-y-2.5 border-t border-ink/[0.07] pt-6">
                {stage.points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm text-ink">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" strokeWidth={2.5} />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
        {/* Room at the end so the last card can line up on the left like the others */}
        <div aria-hidden="true" className="w-[calc(13.5%-1.25rem)] shrink-0 md:w-[calc(32%-1.25rem)] lg:w-[calc(61.5%-1.25rem)]" />
      </div>

      <div className="mt-8 flex items-center gap-5">
        <span className="text-sm font-semibold tabular-nums text-ink">
          {pad(index + 1)} <span className="text-ink/35">/ {pad(COUNT)}</span>
        </span>
        <span className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-ink/10">
          <motion.span
            className="absolute inset-y-0 left-0 bg-accent"
            animate={{ width: `${((index + 1) / COUNT) * 100}%` }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          />
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="View previous stage"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-ink/40 hover:bg-surface-raised disabled:opacity-35 disabled:hover:bg-white cursor-pointer disabled:cursor-default"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            disabled={index === COUNT - 1}
            aria-label="View next stage"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-ink/40 hover:bg-surface-raised disabled:opacity-35 disabled:hover:bg-white cursor-pointer disabled:cursor-default"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
