import type { LucideIcon } from 'lucide-react';
import { SiteImage } from './SiteImage';

interface CircleCollageProps {
  icon: LucideIcon;
  className?: string;
}

// A large round photo inside a soft ring, a smaller round photo overlapping it and a blue disc with an icon.
export function CircleCollage({ icon: Icon, className = '' }: CircleCollageProps) {
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-lg ${className}`}>
      <span className="absolute inset-0 rounded-full bg-accent-soft" aria-hidden="true" />
      <div className="absolute inset-5 overflow-hidden rounded-full border-8 border-paper">
        <SiteImage alt="Our team at work" label="Team image 1" width={440} height={440} className="h-full w-full" />
      </div>
      <div className="absolute left-0 top-[4%] size-[40%] overflow-hidden rounded-full border-8 border-paper">
        <SiteImage alt="One of the team" label="Team image 2" width={200} height={200} className="h-full w-full" />
      </div>
      <span
        className="absolute bottom-[6%] right-[4%] flex size-20 items-center justify-center rounded-full bg-accent text-on-primary ring-8 ring-paper sm:size-24"
        aria-hidden="true"
      >
        <Icon className="h-8 w-8" />
      </span>
    </div>
  );
}
