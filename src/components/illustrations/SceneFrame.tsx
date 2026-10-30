import { ReactNode } from 'react';

interface SceneFrameProps {
  children: ReactNode;
  className?: string;
  height?: number;
}

// Shared canvas for every illustration: 240 wide, decorative only.
export function SceneFrame({ children, className = '', height = 160 }: SceneFrameProps) {
  return (
    <svg viewBox={`0 0 240 ${height}`} className={`h-full w-full ${className}`} fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}
