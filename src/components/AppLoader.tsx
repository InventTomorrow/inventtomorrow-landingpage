import { AnimatePresence, m } from 'motion/react';
import { useAppReady } from '../hooks/useAppReady';

// Full-screen loader shown while the site first loads. It fades out once the page and fonts are ready.
export function AppLoader() {
  const isReady = useAppReady();

  return (
    <AnimatePresence>
      {!isReady && (
        <m.div
          key="app-loader"
          role="status"
          aria-live="polite"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-navy-glow text-white"
        >
          <div className="relative size-24">
            <span className="absolute inset-0 rounded-full border-4 border-white/15 border-t-accent motion-safe:animate-spin" aria-hidden="true" />
            <img
              src="/images/logo-mark.png"
              alt=""
              width={72}
              height={72}
              fetchPriority="high"
              className="absolute inset-3 size-18 rounded-full bg-white object-contain p-2"
            />
          </div>
          <p className="font-display text-xl font-semibold">Invent Tomorrow</p>
          <span className="sr-only">Loading the site</span>
        </m.div>
      )}
    </AnimatePresence>
  );
}
