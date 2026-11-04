import { m } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';
import { getRevealVariants, type RevealVariant } from '../utils/revealVariants';

export interface RevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  // How far it travels, in px (ignored by zoom and fade)
  distance?: number;
  delay?: number;
  duration?: number;
  // false: plays again each time it scrolls into view
  once?: boolean;
  as?: 'div' | 'section' | 'span' | 'h1' | 'h2' | 'h3' | 'p' | 'nav' | 'li' | 'ul' | 'ol';
  className?: string;
  style?: CSSProperties;
}

// Scroll-in animation for one element: it eases into place the first time it is on screen. Opacity and transform only, so it is cheap.
// For a row or grid of siblings use Stagger and StaggerItem instead, which share one observer.
export function Reveal({ children, variant = 'up', distance = 24, delay = 0, duration = 0.5, once = true, as = 'div', className, style }: RevealProps) {
  const Tag = m[as];
  return (
    <Tag
      className={className}
      style={style}
      initial="hidden"
      whileInView="shown"
      viewport={{ once, amount: 0.2 }}
      variants={getRevealVariants(variant, distance, duration, delay)}
    >
      {children}
    </Tag>
  );
}
