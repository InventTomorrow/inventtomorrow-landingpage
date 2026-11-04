import { m } from 'motion/react';
import type { ReactNode } from 'react';

interface StaggerProps {
  children: ReactNode;
  // Seconds between one item and the next
  gap?: number;
  // Seconds before the first item
  delay?: number;
  as?: 'div' | 'ul' | 'ol' | 'dl' | 'section';
  className?: string;
}

// Wrap a short row or grid, and put a StaggerItem on each child: they appear one after another when the group scrolls into view.
// One observer serves the whole group. For tall lists, give each item its own Reveal so lower items wait until they are seen.
export function Stagger({ children, gap = 0.08, delay = 0, as = 'div', className }: StaggerProps) {
  const Tag = m[as];
  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, shown: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </Tag>
  );
}
