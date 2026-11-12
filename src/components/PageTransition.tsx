import { m } from 'motion/react';
import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { PageFallback } from './PageFallback';

// Fades each page in when the route changes. Opacity only and no exit animation, so navigation is never held back.
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  const { pathname } = useLocation();
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  return (
    <m.div key={pathname} className={className} initial={hasMounted ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: 'easeOut' }}>
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
    </m.div>
  );
}
