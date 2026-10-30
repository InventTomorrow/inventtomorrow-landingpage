import { ComponentType, ReactNode } from 'react';
import { FadeUp } from './FadeUp';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  // Optional illustration shown above the heading
  scene?: ComponentType;
  className?: string;
}

export function SectionHeading({ eyebrow, title, subtitle, scene: Scene, className = '' }: SectionHeadingProps) {
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {Scene && (
        <FadeUp delay={0} y={16} className="mb-2 h-32 w-52 sm:h-36 sm:w-60">
          <Scene />
        </FadeUp>
      )}
      <FadeUp delay={0} y={8} className="mb-5">
        <span className="droplet-mark" aria-hidden="true" />
      </FadeUp>
      {eyebrow && (
        <FadeUp delay={0.05} y={12} className="mb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{eyebrow}</span>
        </FadeUp>
      )}
      <FadeUp delay={0.12} y={18}>
        <h2 className="max-w-3xl text-3xl sm:text-[2.75rem] font-bold tracking-tight leading-[1.12] text-ink text-balance">
          {title}
        </h2>
      </FadeUp>
      {subtitle && (
        <FadeUp delay={0.2} y={14}>
          <p className="mt-4 max-w-xl text-base sm:text-lg leading-relaxed text-muted">{subtitle}</p>
        </FadeUp>
      )}
    </div>
  );
}
