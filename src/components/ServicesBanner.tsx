import { ClipboardCheck } from 'lucide-react';
import { AUDIT_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { Reveal } from './Reveal';
import { SiteImage } from './SiteImage';

// Blue call-to-action banner with a slanted photo on the right.
export function ServicesBanner() {
  return (
    <Reveal variant="zoom" delay={0.1} className="relative mt-16 grid overflow-hidden rounded-3xl bg-accent-glow lg:grid-cols-[1.25fr_0.75fr]">
      <div className="relative z-10 flex flex-col items-start justify-center gap-5 p-8 sm:p-12 lg:py-16">
        <h3 className="max-w-md text-3xl font-semibold leading-tight text-on-primary sm:text-4xl">Not sure which fix you need first?</h3>
        <p className="max-w-md text-lg text-on-primary/90">Your free audit shows which leak costs you the most.</p>
        <CtaButton size="lg" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
      </div>

      <span
        className="absolute left-[60%] top-1/2 z-20 hidden size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-paper text-accent lg:flex"
        aria-hidden="true"
      >
        <ClipboardCheck className="h-8 w-8" />
      </span>

      <div className="relative min-h-56 lg:[clip-path:polygon(18%_0,100%_0,100%_100%,0_100%)]">
        <SiteImage
          alt="A cleaner at work"
          label="Banner image"
          width={640}
          height={420}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </Reveal>
  );
}
