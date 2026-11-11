import { STATS } from '../content/stats';
import { CountUp } from './CountUp';
import { Stagger } from './Stagger';
import { StaggerItem } from './StaggerItem';

interface StatsSectionProps {
  // Navy band with dividers between the numbers
  isDark?: boolean;
  className?: string;
}

// Four key numbers. They appear one after another and count up as the band scrolls into view.
export function StatsSection({ isDark = false, className = '' }: StatsSectionProps) {
  return (
    <section
      id="stats"
      className={`relative z-10 w-full overflow-hidden px-6 sm:px-12 ${isDark ? 'bg-navy-glow py-14 text-white sm:py-16' : 'bg-paper py-14 sm:py-16'} ${className}`}
    >
      <Stagger
        as="dl"
        gap={0.1}
        className={`mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4 ${isDark ? 'lg:gap-x-0 lg:divide-x lg:divide-white/15' : ''}`}
      >
        {STATS.map((stat) => (
          <StaggerItem key={stat.label} className={`flex min-w-0 flex-col gap-2 ${isDark ? 'lg:px-8 lg:first:pl-0' : ''}`}>
            <dt className={`text-base sm:text-lg ${isDark ? 'text-white/70' : ''}`}>{stat.label}</dt>
            <dd
              className={`order-first whitespace-nowrap font-display text-4xl font-semibold leading-none tabular-nums sm:text-5xl xl:text-6xl ${isDark ? 'text-white' : 'text-primary'}`}
            >
              <CountUp value={stat.value} />
              {stat.suffix && <span className="text-xl text-accent sm:text-2xl xl:text-3xl">{stat.suffix}</span>}
            </dd>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
