import { m } from 'motion/react';
import { Suspense, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { PageFallback } from './PageFallback';

// Fades each page in when the route changes. Opacity only and no exit animation, so navigation is never held back.
export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <m.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
    </m.div>
  );
}
