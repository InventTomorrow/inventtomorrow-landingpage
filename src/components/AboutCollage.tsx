import { SiteImage } from './SiteImage';
import { WaveLines } from './WaveLines';

interface AboutCollageProps {
  badgeValue: string;
  badgeLabel: string;
}

// A tall photo with a smaller one overlapping its corner (white frame) and a blue rounded badge, over thin wave lines.
export function AboutCollage({ badgeValue, badgeLabel }: AboutCollageProps) {
  return (
    <div className="relative mx-auto w-full max-w-xl pb-14 pl-8 sm:pl-12">
      <WaveLines className="-left-24 -top-10 -z-10 h-[120%] w-[140%]" />
      <div className="ml-auto w-[80%]">
        <SiteImage alt="Our team helping a cleaning business" label="About image 1" width={480} height={520} className="rounded-[2rem]" />
      </div>
      <div className="absolute bottom-0 right-0 w-[46%] rounded-3xl bg-paper p-2 sm:p-3">
        <SiteImage alt="A finished clean" label="About image 2" width={260} height={260} className="rounded-2xl" />
      </div>
      <div className="absolute left-0 top-8 flex size-36 flex-col items-center justify-center rounded-3xl bg-accent-glow p-4 text-center text-on-primary sm:size-44">
        <span className="font-display text-5xl font-semibold leading-none sm:text-6xl">{badgeValue}</span>
        <span className="mt-2 text-xs sm:text-sm">{badgeLabel}</span>
      </div>
    </div>
  );
}
