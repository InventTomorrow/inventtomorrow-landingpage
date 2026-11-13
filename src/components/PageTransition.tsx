import { Suspense, useLayoutEffect, type ReactNode } from 'react';
import { PageFallback } from './PageFallback';

function InitialPageReady() {
  useLayoutEffect(() => {
    // Inside the route's Suspense boundary: runs only after the actual page
    // commits, never when just the shared header or fallback has mounted.
    const bootstrap = document.getElementById('app-bootstrap');
    if (!bootstrap) return;
    document.getElementById('root')?.removeAttribute('inert');
    bootstrap.remove();
  }, []);
  return null;
}

// Keep the route visible while its content resolves; never fade an entire page through blank.
export function PageTransition({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Suspense fallback={<PageFallback />}>
        {children}
        <InitialPageReady />
      </Suspense>
    </div>
  );
}
