import { Check, X, type LucideIcon } from 'lucide-react';
import { m } from 'motion/react';
import { StaggerItem } from './StaggerItem';

interface ChangeRowProps {
  icon: LucideIcon;
  before: string;
  after: string;
}

// One line of the before/after table: the old way struck through, the topic icon in the middle, the new way sliding in after it.
// Meant to sit in a Stagger.
export function ChangeRow({ icon: Icon, before, after }: ChangeRowProps) {
  return (
    <StaggerItem as="li" distance={14} className="grid items-center gap-3 border-t border-border py-6 lg:grid-cols-[1fr_auto_1fr] lg:gap-10">
      <div className="flex items-center gap-3 text-body lg:justify-end lg:text-right">
        <X className="h-5 w-5 shrink-0 lg:order-last" aria-hidden="true" />
        <span className="text-base line-through decoration-primary/30">{before}</span>
      </div>

      <span className="hidden size-12 items-center justify-center rounded-full border-2 border-accent bg-paper text-accent lg:flex" aria-hidden="true">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>

      <m.div
        variants={{ hidden: { opacity: 0, x: 16 }, shown: { opacity: 1, x: 0, transition: { delay: 0.3, duration: 0.45, ease: [0.22, 1, 0.36, 1] } } }}
        className="flex items-center gap-3 font-display text-lg font-semibold text-primary"
      >
        <Check className="h-5 w-5 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
        {after}
      </m.div>
    </StaggerItem>
  );
}
