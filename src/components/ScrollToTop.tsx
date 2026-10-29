import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { smoothScrollTo } from '../utils/smoothScroll';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const stayFocusedEl = document.getElementById('stay-focused');
      if (stayFocusedEl) {
        // On pages with the 'stay-focused' section (e.g. HomePage),
        // reveal the button once the section enters the upper half of the viewport or is scrolled past
        const rect = stayFocusedEl.getBoundingClientRect();
        setVisible(rect.top <= window.innerHeight * 0.6);
      } else {
        // Fallback for pages without 'stay-focused': appear after scrolling 400px
        setVisible(window.scrollY > 400);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = () => {
    smoothScrollTo(0);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          initial={{ opacity: 0, scale: 0.8, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 16 }}
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Scroll to top"
          title="Scroll to top"
          className="group fixed bottom-6 right-6 z-40 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/15 bg-navy/80 text-white/90 shadow-pop backdrop-blur-md transition-all duration-200 hover:border-white/30 hover:bg-navy hover:text-white hover:shadow-pop-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue cursor-pointer"
        >
          <ArrowUp className="h-5 w-5 transition-transform duration-200 group-hover:-translate-y-0.5 text-white/90 group-hover:text-white" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
