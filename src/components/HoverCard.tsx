import type { LucideIcon } from 'lucide-react';
import type { FanOutStart } from '../utils/fanOut';
import { EmergeFromBehind } from './EmergeFromBehind';

interface HoverCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
  // Where the cell starts before it slides out from behind its neighbours
  start: FanOutStart;
  // Small chips under the text
  tags?: string[];
  // Extra classes for the cell, e.g. the divider borders of the grid it sits in
  className?: string;
}

// A box-less cell in the About-page style: an icon chip that fills in on hover, with the grid's divider lines around it.
export function HoverCard({ icon: Icon, title, text, start, tags, className = '' }: HoverCardProps) {
  return (
    <EmergeFromBehind start={start} className="h-full" innerClassName="h-full">
      <div className={`spotlight group flex h-full flex-col p-7 sm:p-9 ${className}`}>
        <span className="flex h-12 w-12 items-center justify-center rounded-drop bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>

        <div className="flex-1">
          <h3 className="mt-6 text-xl font-semibold tracking-tight text-ink">{title}</h3>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted">{text}</p>
        </div>

        {tags && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-ink/[0.08] pt-6">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-stone px-3 py-1 text-sm text-ink/80">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </EmergeFromBehind>
  );
}
