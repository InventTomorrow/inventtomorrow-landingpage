import { FadeUp } from './FadeUp';
import { CtaButton } from './CtaButton';

interface FinalCtaSectionProps {
  onOpenAudit?: () => void;
}

export function FinalCtaSection({ onOpenAudit }: FinalCtaSectionProps) {
  return (
    <section className="relative z-10 w-full bg-ink px-6 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <FadeUp delay={0.05} y={18}>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] text-white text-balance">
            Find out what you're losing. <span className="text-accent-light">It's free.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.12} y={16}>
          <p className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-white/70">
            We contact your business like a real customer, then walk you through what we found on a 15-minute call.
          </p>
        </FadeUp>

        <FadeUp delay={0.2} y={16} className="mt-10 flex flex-col items-center">
          <CtaButton size="lg" onClick={onOpenAudit}>
            Get my free audit
          </CtaButton>
          <p className="mt-5 text-sm text-white/55">No contract · No pressure · Just the numbers</p>
        </FadeUp>
      </div>
    </section>
  );
}
