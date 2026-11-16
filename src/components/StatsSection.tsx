import { STATS } from '../content/stats';
import { Stagger } from './Stagger';
import { StaggerItem } from './StaggerItem';

interface StatsSectionProps {
  // Navy band with dividers between the numbers
  isDark?: boolean;
  className?: string;
}

// Final values are rendered once so previews, screen readers and visitors see the same proof.
export function StatsSection({ isDark = false, className = '' }: StatsSectionProps) {
  const divider = isDark ? 'border-white/15' : 'border-[var(--color-border)]';
  return (
    <section
      id="stats"
      className={`relative z-10 w-full overflow-hidden px-6 sm:px-12 ${isDark ? 'bg-navy-glow py-10 text-white sm:py-16' : 'bg-paper py-10 sm:py-16'} ${className}`}
    >
      <Stagger
        as="dl"
        gap={0.1}
        className={`mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4 ${isDark ? 'lg:divide-x lg:divide-white/15' : ''}`}
      >
        {STATS.map((stat) => (
          <StaggerItem
            key={stat.label}
            className={`flex min-w-0 flex-col items-center gap-2 px-2 py-7 text-center sm:px-8 lg:py-0 ${divider} max-lg:[&:nth-child(odd)]:border-r max-lg:[&:nth-child(-n+2)]:border-b`}
          >
            <dt className={`max-w-[12rem] text-balance text-base leading-snug sm:max-w-none sm:text-lg ${isDark ? 'text-white/70' : ''}`}>{stat.bold && stat.label.startsWith(stat.bold)
                ? <><strong className={`font-bold ${isDark ? 'text-white' : 'text-primary'}`}>{stat.bold}</strong>{stat.label.slice(stat.bold.length)}</>
                : stat.label}
            </dt>
            <dd
              className={`order-first flex flex-nowrap items-baseline justify-center gap-x-1 font-display text-3xl font-semibold leading-none tabular-nums sm:text-4xl xl:text-5xl ${isDark ? 'text-white' : 'text-primary'}`}
            >
              <span className="whitespace-nowrap">{stat.value}</span>
              {stat.suffix && <span className="whitespace-nowrap text-xl text-accent sm:text-2xl xl:text-3xl">{stat.suffix.trim()}</span>}
            </dd>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
