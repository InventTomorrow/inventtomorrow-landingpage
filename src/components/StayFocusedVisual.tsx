import { CheckCircle2, PhoneMissed } from 'lucide-react';
import { FIXES } from '../content/fixes';
import { SiteImage } from './SiteImage';

const [, MISSED_CALL_FIX] = FIXES;
const AUTO_REPLY = MISSED_CALL_FIX.scene.messages[0].text;

// A photo with three floating cards that tell the 2:14 pm story: the call, the instant reply and the handled lead.
export function StayFocusedVisual() {
  return (
    <div className="relative mx-auto w-full max-w-lg px-4 pb-10 pt-6 sm:px-0">
      <span className="absolute -right-2 top-0 size-44 rounded-full bg-accent-soft" aria-hidden="true" />
      <SiteImage alt="A cleaner at work while the phone rings" label="Stay focused image" width={520} height={600} className="relative rounded-[2rem]" />

      <div className="illu-float absolute left-0 top-14 flex items-center gap-3 rounded-2xl bg-paper p-4 shadow-float sm:-left-6">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xs bg-accent-soft text-accent">
          <PhoneMissed className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-display text-lg font-semibold text-primary">2:14 pm</span>
          <span className="text-sm">Your phone rings.</span>
        </span>
      </div>

      <div className="illu-float-slow absolute right-0 top-1/2 max-w-[15rem] rounded-2xl rounded-br-none bg-accent-glow p-4 text-sm text-on-primary sm:-right-6">
        <p className="text-on-primary">{AUTO_REPLY}</p>
        <p className="mt-2 text-xs text-on-primary/80">2:14 pm · in seconds</p>
      </div>

      <div className="illu-float absolute bottom-2 left-6 flex items-center gap-3 rounded-2xl bg-paper p-4 shadow-float">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xs bg-accent text-on-primary">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-display text-lg font-semibold text-primary">2:20 pm</span>
          <span className="text-sm">The lead is handled.</span>
        </span>
      </div>
    </div>
  );
}
