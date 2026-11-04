import { STATS } from '../content/stats';
import { CountUp } from './CountUp';
import { Stagger } from './Stagger';
import { StaggerItem } from './StaggerItem';
import { WaveLines } from './WaveLines';

interface StatsSectionProps {
  // Navy band with dividers between the numbers
  isDark?: boolean;
}

// Four key numbers. They appear one after another and count up as the band scrolls into view.
export function StatsSection({ isDark = false }: StatsSectionProps) {
  return (
    <section
      className={`relative z-10 w-full overflow-hidden px-6 sm:px-12 ${isDark ? 'bg-navy-glow py-14 text-white sm:py-16' : 'bg-paper pb-16 sm:pb-20'}`}
    >
      {isDark && <WaveLines isOnDark className="inset-0 h-full w-full" />}
      <Stagger
        as="dl"
        gap={0.1}
        className={`mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-10 lg:grid-cols-4 ${isDark ? 'lg:gap-x-0 lg:divide-x lg:divide-white/15' : ''}`}
      >
        {STATS.map((stat) => (
          <StaggerItem key={stat.label} className={`flex flex-col-reverse gap-2 ${isDark ? 'lg:px-8 lg:first:pl-0' : ''}`}>
            <dt className={`text-base sm:text-lg ${isDark ? 'text-white/70' : ''}`}>{stat.label}</dt>
            <dd
              className={`whitespace-nowrap font-display text-4xl font-semibold leading-none sm:text-5xl xl:text-6xl ${isDark ? 'text-white' : 'text-primary'}`}
            >
              <CountUp value={stat.value} />
              {stat.suffix && <span className="text-accent">{stat.suffix}</span>}
            </dd>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
