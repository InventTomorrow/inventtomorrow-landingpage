import { Sparkles, CheckCircle2 } from 'lucide-react';
import { FadeUp } from './FadeUp';

const SECTORS = [
  {
    title: 'Cleaning & Maid Services',
    pain: 'Hands in gloves, vacuum running, loud equipment.',
    solution:
      'Instantly replies to frantic Airbnb and residential homeowners looking for next-day turnovers.',
    metrics: '+42% more booked jobs',
  },
  {
    title: 'HVAC & Plumbing Trades',
    pain: 'Under crawlspaces or up in attics where calls are missed.',
    solution:
      'Screens emergency calls, tags priority dispatch, and sends confirmation texts before competitors even see the missed call.',
    metrics: '< 10s urgent triage',
  },
  {
    title: 'Mobile Detailing & Window Tint',
    pain: 'Buffing vehicles or spraying solutions all afternoon.',
    solution:
      'Gathers vehicle make, package selection, and driveway location to send automated invoices and booking confirmations.',
    metrics: 'Zero manual phone tag',
  },
  {
    title: 'Roofing & General Contractors',
    pain: 'On active job sites managing subcontractors and materials.',
    solution:
      'Directs inbound storm or estimate leads into preliminary inspection questionnaires with photo upload links.',
    metrics: '100% captured inquiries',
  },
];

export function WhoWeHelpSection() {
  return (
    <section
      id="who-we-help"
      className="relative z-10 w-full min-h-screen text-white flex flex-col items-center justify-center px-4 sm:px-8 section-y section-deco"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center text-center">
        <FadeUp delay={0.1} y={16}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#60A5FA]">
              WHO WE SERVE
            </span>
          </div>
        </FadeUp>

        <FadeUp delay={0.2} y={24}>
          <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-3xl">
            Built For Operators Who Win By Doing, Not Sitting At A Desk.
          </h2>
        </FadeUp>

        <FadeUp delay={0.3} y={20}>
          <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            When you're doing high-craft work in the field, every second spent answering price-shoppers pulls you out of revenue-generating work.
          </p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16 w-full text-left">
          {SECTORS.map((sector, index) => (
            <FadeUp
              key={sector.title}
              delay={0.2 + index * 0.1}
              y={24}
              className="p-6 sm:p-8 rounded-2xl bg-neutral-900/50 border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {sector.title}
                  </h3>
                  <span className="text-[11px] font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full">
                    {sector.metrics}
                  </span>
                </div>

                <div className="space-y-3 mt-4 text-sm">
                  <div className="flex items-start gap-2.5 text-neutral-400">
                    <span className="text-red-400 font-medium text-xs uppercase tracking-wider shrink-0 mt-0.5">
                      The Pain:
                    </span>
                    <span>{sector.pain}</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-neutral-200">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{sector.solution}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs text-neutral-400">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>Zero interruption workflow active</span>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}
