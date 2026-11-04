import { ReactNode } from 'react';

// A small column title on a navy background with a short blue line under it.
export function AccentHeading({ children }: { children: ReactNode }) {
  return (
    <p className="relative mb-2 pb-3 font-display text-xl font-semibold text-white after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-12 after:bg-accent">
      {children}
    </p>
  );
}
