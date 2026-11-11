import { ComponentType, ReactNode } from 'react';
import { Stagger } from './Stagger';
import { StaggerItem } from './StaggerItem';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  // Second part of the heading, shown faded on its own line
  titleMuted?: ReactNode;
  subtitle?: ReactNode;
  // Optional illustration shown above the heading
  scene?: ComponentType;
  align?: 'center' | 'left';
  className?: string;
}

const NOTCH = 'h-3 w-2 shrink-0 bg-accent [clip-path:polygon(0_0,100%_0,35%_100%,0_100%)]';

// The heading block of a section. Its parts appear one after another, watched by a single observer.
export function SectionHeading({ eyebrow, title, titleMuted, subtitle, scene: Scene, align = 'center', className = '' }: SectionHeadingProps) {
  const isCentered = align === 'center';

  return (
    <Stagger gap={0.07} className={`flex flex-col ${isCentered ? 'items-center text-center' : 'items-start text-left'} ${className}`}>
      {Scene && (
        <StaggerItem distance={16} className="mb-2 h-32 w-52 sm:h-36 sm:w-60">
          <Scene />
        </StaggerItem>
      )}
      {eyebrow && (
        <StaggerItem distance={12} className="mb-3">
          <p className="flex items-center gap-2 font-display text-sm font-medium uppercase text-accent sm:text-base">
            <span className={NOTCH} aria-hidden="true" />
            {eyebrow}
            {isCentered && <span className={`${NOTCH} -scale-x-100`} aria-hidden="true" />}
          </p>
        </StaggerItem>
      )}
      <StaggerItem distance={18}>
        <h2 className="max-w-3xl text-3xl sm:text-4xl xl:text-5xl font-semibold leading-[1.2] tracking-display text-primary text-balance">
          {title}
          {titleMuted && (
            <>
              {' '}
              <span className="block text-accent">{titleMuted}</span>
            </>
          )}
        </h2>
      </StaggerItem>
      {subtitle && (
        <StaggerItem distance={14}>
          <p className={`mt-4 max-w-xl text-base sm:text-lg ${isCentered ? '' : 'max-w-2xl'}`}>{subtitle}</p>
        </StaggerItem>
      )}
    </Stagger>
  );
}
