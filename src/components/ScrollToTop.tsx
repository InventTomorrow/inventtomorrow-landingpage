import { ArrowUp } from 'lucide-react';
import { AnimatePresence, m, useScroll } from 'motion/react';
import { useIsScrolled } from '../hooks/useIsScrolled';
import { smoothScrollTo } from '../utils/smoothScroll';

const SHOW_AFTER_PX = 400;

// Appears once the visitor has scrolled. A ring around it fills as they move down the page; the ring follows the scroll
// through a motion value, so scrolling never re-renders the button.
export function ScrollToTop() {
  const isVisible = useIsScrolled(SHOW_AFTER_PX);
  const { scrollYProgress } = useScroll();

  return (
    <AnimatePresence>
      {isVisible && (
        <m.button
          type="button"
          onClick={() => smoothScrollTo(0)}
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Scroll to top"
          title="Scroll to top"
          className="group fixed bottom-6 right-6 z-40 flex size-12 items-center justify-center rounded-full bg-primary text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:size-14 cursor-pointer"
        >
          <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" fill="none" aria-hidden="true">
            <circle cx="24" cy="24" r="22" className="stroke-white/20" strokeWidth="2.5" />
            <m.circle
              cx="24"
              cy="24"
              r="22"
              className="stroke-accent transition-colors duration-200 group-hover:stroke-white"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{ pathLength: scrollYProgress }}
            />
          </svg>
          <ArrowUp className="relative h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5" aria-hidden="true" />
        </m.button>
      )}
    </AnimatePresence>
  );
}
