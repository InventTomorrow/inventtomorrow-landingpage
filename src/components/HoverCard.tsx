import type { LucideIcon } from 'lucide-react';
import { FadeUp } from './FadeUp';

interface HoverCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
  delay?: number;
  // Large faint number in the corner, e.g. "01"
  number?: string;
  // Small chips under the text
  tags?: string[];
  // 'plain' drops the card box (border, shadow, rounded corners) so a grid can be split with divider lines instead
  variant?: 'card' | 'plain';
  // Extra classes for the surface, e.g. the divider borders of a plain grid
  className?: string;
}

const SURFACES = {
  card: 'rounded-3xl border border-ink/[0.08] bg-white p-7 shadow-card hover:border-navy hover:bg-navy hover:shadow-card-dark sm:p-8',
  plain: 'bg-transparent p-7 hover:bg-navy sm:p-9',
};

const SMOOTH = 'duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]';

// A white card that fades to navy on hover. Every colour moves on the same slow curve so it feels smooth.
export function HoverCard({ icon: Icon, title, text, delay = 0, number, tags, variant = 'card', className = '' }: HoverCardProps) {
  return (
    <FadeUp delay={delay} y={18} className="h-full">
      <div
        className={`group relative flex h-full flex-col overflow-hidden transition-[background-color,border-color,box-shadow] ${SURFACES[variant]} ${className} ${SMOOTH}`}
      >
        <span
          className={`pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-blue/40 opacity-0 blur-3xl transition-opacity group-hover:opacity-100 ${SMOOTH}`}
          aria-hidden="true"
        />

        <div className="relative flex items-start justify-between">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-drop bg-accent-soft text-accent transition-colors group-hover:bg-white/10 group-hover:text-sky ${SMOOTH}`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          {number && (
            <span
              className={`text-4xl font-bold leading-none tracking-tight text-ink/[0.1] tabular-nums transition-colors group-hover:text-white/20 ${SMOOTH}`}
            >
              {number}
            </span>
          )}
        </div>

        <div className="relative flex-1">
          <h3 className={`mt-6 text-xl font-semibold tracking-tight text-ink transition-colors group-hover:text-white ${SMOOTH}`}>
            {title}
          </h3>
          <p className={`mt-2 text-[0.9375rem] leading-relaxed text-muted transition-colors group-hover:text-white/75 ${SMOOTH}`}>
            {text}
          </p>
        </div>

        {tags && (
          <div
            className={`relative mt-6 flex flex-wrap gap-2 border-t border-ink/[0.07] pt-6 transition-colors group-hover:border-white/15 ${SMOOTH}`}
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full bg-stone px-3 py-1 text-sm text-ink/80 transition-colors group-hover:bg-white/10 group-hover:text-white/90 ${SMOOTH}`}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </FadeUp>
  );
}
