import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Stagger } from './Stagger';
import { StaggerItem } from './StaggerItem';

export interface FocusItem {
  title: string;
  text?: string;
  time?: string;
  icon: LucideIcon;
}

interface FocusColumnProps {
  // Which side of the picture the column sits on. On large screens the left column reads towards the picture.
  side: 'left' | 'right';
  eyebrow: string;
  title: string;
  badge: ReactNode;
  items: FocusItem[];
  // Solid blue icons, for the side that carries the most
  isFilled?: boolean;
}

// One side of "Your focus vs Our system": a heading, a small badge and a list of steps strung on a dotted line. No box around it.
export function FocusColumn({ side, eyebrow, title, badge, items, isFilled = false }: FocusColumnProps) {
  const isLeft = side === 'left';

  return (
    <div className={isLeft ? 'lg:text-right' : ''}>
      <div className={`flex flex-col gap-3 ${isLeft ? 'lg:items-end' : ''}`}>
        <p className="text-sm font-semibold uppercase text-accent">{eyebrow}</p>
        <p className="font-display text-3xl font-bold text-primary sm:text-4xl">{title}</p>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-paper px-3 py-1.5 text-sm font-medium text-primary">
          {badge}
        </span>
      </div>

      <Stagger
        as="ol"
        gap={0.1}
        className={`relative mt-8 flex flex-col gap-7 before:absolute before:inset-y-7 before:left-7 before:border-l-2 before:border-dashed before:border-accent/40 ${
          isLeft ? 'lg:before:left-auto lg:before:right-7' : ''
        }`}
      >
        {items.map(({ title: itemTitle, text, time, icon: Icon }) => (
          <StaggerItem as="li" key={itemTitle} className={`relative flex items-center gap-4 ${isLeft ? 'lg:flex-row-reverse' : ''}`}>
            <span
              className={`relative z-10 flex size-14 shrink-0 items-center justify-center rounded-full ${
                isFilled ? 'bg-accent text-on-primary' : 'border-2 border-accent bg-paper text-accent'
              }`}
            >
              <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-lg font-semibold leading-snug text-primary">{itemTitle}</p>
              {text && <p className="mt-1 text-sm">{text}</p>}
              {time && <span className="mt-2 inline-block rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">{time}</span>}
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
