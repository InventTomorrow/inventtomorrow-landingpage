import { Check } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { CtaButton } from '../components/CtaButton';
import { DefaultClosingCta } from '../components/FinalCtaSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { usePageMeta } from '../hooks/usePageMeta';
import { AUDIT_PATH } from '../utils/navigation';

export function HowItWorksPage() {
  usePageMeta(
    'How It Works | Invent Tomorrow',
    'Review your process, approve your messages and put a follow up system in place for your cleaning business.',
  );

  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="Great work starts with"
        titleMuted="a better process"
        description="Four clear steps from audit to launch, built around the way your team already works."
      >
        <CtaButton size="lg" variant="accent" to={AUDIT_PATH}>
          Run My Audit
        </CtaButton>
      </PageHero>

      <HowItWorksSection />

      <section className="relative z-10 w-full bg-paper section-y px-6 sm:px-12">
        <div className="mx-auto max-w-[68.75rem]">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-semibold leading-[1.2] tracking-display text-primary text-balance sm:text-4xl xl:text-5xl">
              You Stay in Control. <span className="text-accent">We Handle the Rest.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-body sm:text-lg">
              You make the important decisions. We take care of the everyday follow ups.
            </p>
          </div>

          <div className="mt-10 grid items-stretch gap-6 md:grid-cols-2">
            <article className="flex h-full flex-col rounded-2xl border border-border bg-paper p-4 shadow-sm sm:p-6">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
                <img
                  src="/images/clear-roles-you-decide.webp"
                  alt="A cleaning business owner approving messages and schedules on her laptop."
                  width={900}
                  height={675}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain"
                />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-primary">You Decide</h3>
              <ul className="mt-3 space-y-2.5 text-primary">
                {['Tell us how you work', 'Approve customer messages', 'Handle special requests'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="flex h-full flex-col rounded-2xl border border-[#DCEBFF] bg-[#F3F8FF] p-4 shadow-sm sm:p-6">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl">
                <img
                  src="/images/clear-roles-we-handle.webp"
                  alt="A system handling customer replies, quotes, repeat bookings, and reviews."
                  width={900}
                  height={675}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain"
                />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold text-primary">We Handle</h3>
              <ul className="mt-3 space-y-2.5 text-primary">
                {['Reply to new inquiries', 'Follow up on quotes', 'Bring customers back'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="mt-1 size-4 shrink-0 text-accent" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <DefaultClosingCta />
    </>
  );
}
