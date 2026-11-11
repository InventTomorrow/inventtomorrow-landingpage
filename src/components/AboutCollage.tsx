import { SiteImage } from './SiteImage';

interface AboutCollageProps {
  badgeValue: string;
  badgeLabel: string;
}

// A tall illustration with a smaller one overlapping its corner and a blue rounded badge, over thin wave lines.
export function AboutCollage({ badgeValue, badgeLabel }: AboutCollageProps) {
  return (
    <div className="relative mx-auto w-full max-w-xl pb-14 pl-8 sm:pl-12">
      <div className="ml-auto aspect-[12/13] w-[80%] overflow-hidden rounded-[2rem]">
        <SiteImage
          src="/images/about-systems-team-v3.webp"
          alt="3D illustration of a technology team building connected email, messaging, and booking workflows."
          label="Simple systems, built together"
          width={480}
          height={520}
          className="h-full! object-top"
        />
      </div>
      <div className="absolute bottom-0 right-0 w-[46%] rounded-3xl bg-paper p-2 sm:p-3">
        <div className="aspect-square overflow-hidden rounded-2xl">
          <SiteImage
            src="/images/about-business-owner-v2.jpg"
            alt="3D illustration of a cleaning business owner using a phone while an AI assistant manages messages and bookings."
            label="Business systems, handled for you"
            width={260}
            height={260}
            className="h-full! object-top"
          />
        </div>
      </div>
      <div className="absolute left-0 top-8 flex size-36 flex-col items-center justify-center rounded-3xl bg-accent-glow p-4 text-center text-on-primary sm:size-44">
        <span className="font-display text-5xl font-semibold leading-none sm:text-6xl">{badgeValue}</span>
        <span className="mt-2 text-xs sm:text-sm">{badgeLabel}</span>
      </div>
    </div>
  );
}
