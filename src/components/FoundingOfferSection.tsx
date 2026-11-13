import { Award, CalendarDays, Check, ShieldCheck } from 'lucide-react';
import { AUDIT_PATH } from '../utils/navigation';
import { FOUNDING_SPOTS_LEFT } from '../utils/freeAudit';
import { CtaButton } from './CtaButton';
import { FadeUp } from './FadeUp';

const REMAINING_SPOTS = FOUNDING_SPOTS_LEFT;
const TOTAL_SPOTS = 5;

const PERKS = [
  'Founding price, locked for life',
  'A direct line to the founders',
  'First in line for setup',
];

const BONUSES = [
  { title: 'Old Quote Import and Clean-Up', text: 'We pull out and clean up your old quotes.' },
  { title: 'Voice-Matched Reply Library', text: '40 ready answers to customer questions, written in your voice.' },
  { title: 'Weekly Booked-Jobs Scoreboard', text: 'A weekly scoreboard of the cleans we booked you.' },
  { title: 'Google Business Profile Booking Tune-Up', text: 'A Google Business Profile tune-up for bookings.' },
];

const GUARANTEE_CONDITIONS = [
  'At least 200 past enquiries or quotes we can contact.',
  'Approve messages within 48 hours.',
  'Reply to leads we hand you within 1 business day.',
];

export function FoundingOfferSection() {
  return (
    <section id="founding-offer" aria-labelledby="offer-title" className="relative z-10 w-full bg-paper section-y px-6 sm:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-14">
          <div className="min-w-0">
            <p className="text-sm font-semibold uppercase text-accent">One done-for-you package</p>
            <h2 id="offer-title" className="mt-3 max-w-[22ch] font-display text-3xl font-semibold leading-[1.15] tracking-display text-primary sm:text-4xl xl:text-[2.75rem]">
              The Spring-Ready <span className="text-accent">Booked Calendar System</span>
            </h2>
            <p className="mt-5 max-w-xl text-base text-ink sm:text-lg">
              All seven fixes, set up, written and run for you. Plus four bonuses:
            </p>

            <ul className="mt-8 divide-y divide-border border-y border-border">
              {BONUSES.map((bonus, index) => (
                <li key={bonus.title} className="flex min-w-0 items-start gap-4 py-5 sm:gap-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-semibold text-accent" aria-label={'Bonus ' + (index + 1)}>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold leading-snug text-primary">{bonus.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed sm:text-base">{bonus.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <CtaButton to={AUDIT_PATH} variant="outline" className="mt-7 w-full sm:w-auto">
              See if I qualify
            </CtaButton>
          </div>

          <FadeUp y={18} className="min-w-0 rounded-2xl border border-border bg-stone p-6 sm:p-8 lg:sticky lg:top-28 xl:p-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase text-accent">Founding clients</p>
              <span className="rounded-full bg-paper px-3 py-1 text-sm font-semibold text-primary">
                {REMAINING_SPOTS} of {TOTAL_SPOTS} founding spots left
              </span>
            </div>
            <h3 className="mt-5 font-display text-2xl font-semibold leading-snug text-primary">5 founding spots.</h3>
            <p className="mt-2 flex items-start gap-2 text-sm font-medium text-primary">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
              <span>Closing <time dateTime="2027-01-15">15 January 2027</time>, or when all 5 are taken.</span>
            </p>

            <div className="mt-6 border-y border-border py-6">
              <p className="flex flex-wrap items-baseline gap-x-2 font-display text-primary">
                <span className="text-4xl font-semibold tracking-display sm:text-5xl">$1,500</span>
                <span className="text-base">setup</span>
              </p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2 font-display text-primary">
                <span className="text-2xl font-semibold">+ $345</span>
                <span className="text-base">a month</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed">Split setup into two payments of $750. Month to month after setup.</p>
            </div>

            <ul className="mt-6 space-y-3">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-sm font-medium leading-relaxed text-primary">
                  <Check className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} aria-hidden="true" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed">
              In return, your results become our next case study. Spots close on 15 January so your follow-up is running ahead of the spring rush.
            </p>
            <CtaButton to={AUDIT_PATH} className="mt-6 w-full min-w-0 whitespace-normal! px-4">
              Claim a founding spot
            </CtaButton>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

export function GuaranteeSection() {
  return (
    <section id="guarantee" aria-labelledby="guarantee-title" className="relative z-10 w-full bg-navy-glow section-y px-6 text-white sm:px-12">
      <div className="mx-auto grid max-w-7xl items-start gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
        <FadeUp y={18} className="min-w-0">
          <Award className="size-8 text-accent" aria-hidden="true" />
          <p className="mt-5 text-sm font-semibold uppercase text-white/70">Our promise</p>
          <h2 id="guarantee-title" className="mt-3 max-w-[22ch] font-display text-3xl font-semibold leading-[1.15] tracking-display sm:text-4xl xl:text-[2.75rem]">
            The Pays For Itself Guarantee
          </h2>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
            If the cleans we book you in your first 90 days don't add up to more than everything you've paid us, you pay no monthly fee until they do.
          </p>
        </FadeUp>

        <div className="min-w-0 rounded-2xl border border-white/20 bg-white/5 p-6 sm:p-8">
          <h3 className="flex items-center gap-3 font-display text-lg font-semibold">
            <ShieldCheck className="size-5 shrink-0 text-white/80" aria-hidden="true" />
            How the guarantee works
          </h3>
          <ul className="mt-5 space-y-4">
            {GUARANTEE_CONDITIONS.map((condition) => (
              <li key={condition} className="flex items-start gap-3 text-sm leading-relaxed text-white/90">
                <Check className="mt-1 size-4 shrink-0 text-white/70" aria-hidden="true" />
                <span>{condition}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-white/20 pt-5 text-sm leading-relaxed text-white/75">
            A clean counts when it's booked in your scheduling tool at your normal price and traced to one of our messages. We compare that booking value with everything you've paid us.
          </p>
          <p className="mt-3 text-sm text-white/75">Full terms in your agreement.</p>
        </div>
      </div>
    </section>
  );
}
