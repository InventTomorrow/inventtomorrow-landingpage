import { motion } from 'motion/react';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { CtaButton } from './CtaButton';
import { TextLink } from './TextLink';
import { AUDIT_PATH } from '../utils/navigation';
import { Award, Check } from 'lucide-react';
import { PromiseScene } from './illustrations/processScenes';

const FILLED_SPOTS = 6;
const TOTAL_SPOTS = 10;

const PERKS = [
  'Founding price, locked in for life',
  'A direct line to the founders',
  'Priority setup for your software',
];

export function FoundingOfferSection() {
  return (
    <section id="founding-offer" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-mist section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-4xl">
        <SectionHeading
          eyebrow="Founding clients"
          title="Become one of our 10 founding clients"
          subtitle="Founding pricing and a direct line to the founders. In return, your results become our first case study."
        />

        <FadeUp
          delay={0.1}
          y={18}
          className="spotlight mt-14 rounded-2xl border border-ink/[0.08] bg-white p-8 transition-colors duration-300 hover:border-ink/25 sm:p-10"
        >
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <ul className="space-y-4">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3.5 font-medium text-ink">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Check className="h-4 w-4" strokeWidth={2.5} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-5 sm:items-end">
              <div
                className="w-full rounded-2xl bg-accent-soft/60 p-5 sm:w-auto sm:min-w-[17rem] sm:text-right"
                role="img"
                aria-label={`${FILLED_SPOTS} of ${TOTAL_SPOTS} founding spots`}
              >
                <p className="text-4xl font-bold tracking-tight text-ink tabular-nums">
                  {FILLED_SPOTS}/{TOTAL_SPOTS} <span className="text-lg font-medium text-muted">founding spots</span>
                </p>
                <div className="mt-4 flex gap-1.5 sm:justify-end" aria-hidden="true">
                  {Array.from({ length: TOTAL_SPOTS }, (_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scaleY: 0, opacity: 0 }}
                      whileInView={{ scaleY: 1, opacity: 1 }}
                      whileHover={{ scaleY: 1.8 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.35 }}
                      className={`h-2 flex-1 origin-bottom rounded-full sm:w-5 sm:flex-none ${i < FILLED_SPOTS ? 'bg-accent' : 'bg-ink/10'}`}
                    />
                  ))}
                </div>
              </div>
              <CtaButton to={AUDIT_PATH} className="w-full sm:w-auto">
                Claim a founding spot
              </CtaButton>
            </div>
          </div>
        </FadeUp>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
          <FadeUp delay={0.18} y={18} className="spotlight spotlight-light flex items-center gap-2 overflow-hidden rounded-2xl bg-navy p-8 text-white">
            <div>
              <Award className="h-6 w-6 text-sky" />
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-sky">Our promise</p>
              <p className="mt-2 text-xl font-semibold leading-snug">
                If we don't book jobs that cover our fee within 90 days, we work free until we do.
              </p>
            </div>
            <div className="-mr-4 hidden h-40 w-44 shrink-0 sm:block">
              <PromiseScene />
            </div>
          </FadeUp>

          <FadeUp
            delay={0.24}
            y={18}
            className="spotlight flex flex-col justify-between rounded-2xl border border-ink/[0.08] bg-white p-8 transition-colors duration-300 hover:border-ink/25"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">An easy start</p>
              <p className="mt-3 text-lg font-semibold text-ink">Not ready for the full system? Start small.</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong className="font-semibold text-ink">Quote Revival: $497, one time.</strong> We revive your old
                quotes in 14 days. Upgrade later and it's credited to your setup.
              </p>
            </div>
            <TextLink to={AUDIT_PATH} className="mt-6 self-start text-sm">
              Start with Quote Revival
            </TextLink>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// Previous version (restore: comment out the component above, uncomment this block, merge the imports)
// import { motion } from 'motion/react';
// import { FadeUp } from './FadeUp';
// import { SectionHeading } from './SectionHeading';
// import { CtaButton } from './CtaButton';
// import { TextLink } from './TextLink';
// import { AUDIT_PATH } from '../utils/navigation';
// import { Award, Check } from 'lucide-react';
// import { PromiseScene } from './illustrations/processScenes';
//
// const TOTAL_SPOTS = 10;
//
// const PERKS = [
//   'Founding price, locked in for life',
//   'A direct line to the founders',
//   'Priority setup for your software',
// ];
//
// export function FoundingOfferSection() {
//   return (
//     <section id="founding-offer" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-mist section-y section-deco px-6 sm:px-12">
//       <div className="mx-auto max-w-4xl">
//         <SectionHeading
//           eyebrow="Founding clients"
//           title="Become one of our 10 founding clients"
//           subtitle="Founding pricing and a direct line to the founders. In return, your results become our first case study."
//         />
//
//         <FadeUp
//           delay={0.1}
//           y={18}
//           className="spotlight mt-14 rounded-2xl border border-ink/[0.08] bg-white p-8 transition-colors duration-300 hover:border-ink/25 sm:p-10"
//         >
//           <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
//             <ul className="space-y-3">
//               {PERKS.map((perk) => (
//                 <li key={perk} className="flex items-center gap-3 text-ink">
//                   <Check className="h-5 w-5 shrink-0 text-accent" />
//                   {perk}
//                 </li>
//               ))}
//             </ul>
//
//             <div className="flex flex-col gap-4 sm:items-end">
//               <div className="sm:text-right">
//                 <p className="text-3xl font-bold tracking-tight text-ink tabular-nums">
//                   {TOTAL_SPOTS} <span className="text-lg font-medium text-muted">founding spots</span>
//                 </p>
//                 <div className="mt-3 flex gap-1 sm:justify-end" aria-hidden="true">
//                   {Array.from({ length: TOTAL_SPOTS }, (_, i) => (
//                     <motion.span
//                       key={i}
//                       initial={{ scaleY: 0, opacity: 0 }}
//                       whileInView={{ scaleY: 1, opacity: 1 }}
//                       whileHover={{ scaleY: 2.4, backgroundColor: 'var(--color-primary-hover)' }}
//                       viewport={{ once: true }}
//                       transition={{ delay: 0.3 + i * 0.05, duration: 0.35 }}
//                       className="h-1.5 w-5 origin-bottom rounded-full bg-accent"
//                     />
//                   ))}
//                 </div>
//               </div>
//               <CtaButton to={AUDIT_PATH} className="w-full sm:w-auto">
//                 Claim a founding spot
//               </CtaButton>
//             </div>
//           </div>
//         </FadeUp>
//
//         <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]">
//           <FadeUp delay={0.18} y={18} className="spotlight spotlight-light flex items-center gap-2 overflow-hidden rounded-2xl bg-navy p-8 text-white">
//             <div>
//               <Award className="h-6 w-6 text-sky" />
//               <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-sky">Our promise</p>
//               <p className="mt-2 text-xl font-semibold leading-snug">
//                 If we don't book jobs that cover our fee within 90 days, we work free until we do.
//               </p>
//             </div>
//             <div className="-mr-4 hidden h-40 w-44 shrink-0 sm:block">
//               <PromiseScene />
//             </div>
//           </FadeUp>
//
//           <FadeUp
//             delay={0.24}
//             y={18}
//             className="spotlight flex flex-col justify-between rounded-2xl border border-ink/[0.08] bg-white p-8 transition-colors duration-300 hover:border-ink/25"
//           >
//             <div>
//               <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">An easy start</p>
//               <p className="mt-3 text-lg font-semibold text-ink">Not ready for the full system? Start small.</p>
//               <p className="mt-2 text-sm leading-relaxed text-muted">
//                 <strong className="font-semibold text-ink">Quote Revival: $497, one time.</strong> We revive your old
//                 quotes in 14 days. Upgrade later and it's credited to your setup.
//               </p>
//             </div>
//             <TextLink to={AUDIT_PATH} className="mt-6 self-start text-sm">
//               Start with Quote Revival
//             </TextLink>
//           </FadeUp>
//         </div>
//       </div>
//     </section>
//   );
// }
