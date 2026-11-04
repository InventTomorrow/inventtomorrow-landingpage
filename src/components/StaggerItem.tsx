import { m } from 'motion/react';
import type { ReactNode } from 'react';
import { getRevealVariants, type RevealVariant } from '../utils/revealVariants';

interface StaggerItemProps {
  children: ReactNode;
  variant?: RevealVariant;
  distance?: number;
  duration?: number;
  as?: 'div' | 'li' | 'p' | 'span' | 'h2' | 'dt' | 'dd';
  className?: string;
}

// One child of a Stagger. It follows its parent's timing, so it needs no observer of its own.
export function StaggerItem({ children, variant = 'up', distance = 20, duration = 0.5, as = 'div', className }: StaggerItemProps) {
  const Tag = m[as];
  return (
    <Tag className={className} variants={getRevealVariants(variant, distance, duration)}>
      {children}
    </Tag>
  );
}
