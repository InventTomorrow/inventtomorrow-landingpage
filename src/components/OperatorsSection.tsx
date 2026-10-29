import { FadeUp } from './FadeUp';

const OPERATOR_VERTICALS = [
  {
    title: 'Turnover & Maid Services',
    description:
      'While your crews are vacuuming and scrubbing, our system responds in seconds. It confirms home size, service package, and locks in next-day turnovers without you touching your phone.',
    highlight: 'Recovers 40+ turnover cleans monthly with zero phone tag',
  },
  {
    title: 'HVAC & Plumbing Trades',
    description:
      'When you are in an attic, under a crawlspace, or on a ladder, urgent diagnostic calls are triaged immediately and booked straight into your dispatch board.',
    highlight: 'Instant triage under 5 seconds before the caller dials a competitor',
  },
  {
    title: 'Mobile Detailing & Restyling',
    description:
      'Vehicle intake, package selection, and driveway location reservations happen entirely in natural SMS conversation while you stay focused on polishing and coating.',
    highlight: 'Automated package booking with zero mid-job interruptions',
  },
  {
    title: 'Roofing & General Contractors',
    description:
      'Storm damage calls and remodel inquiries are routed into structured intake questionnaires with photo uploads and scheduled on-site inspections.',
    highlight: 'Captures 100% of high-ticket inquiries directly to your calendar',
  },
];

export function OperatorsSection() {
  return (
    <section
      id="operators"
      className="relative z-10 w-full section-y section-deco px-6 sm:px-12 max-w-6xl mx-auto flex flex-col items-center text-center"
    >
      <FadeUp delay={0.1} y={16}>
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-sky-400/90 font-mono">
          Engineered For Operators
        </span>
      </FadeUp>

      <FadeUp delay={0.2} y={24}>
        <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-3xl leading-tight">
          Never Drop A High-Value Job While You’re In The Flow.
        </h2>
      </FadeUp>

      <FadeUp delay={0.3} y={20}>
        <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Built for hands-on businesses where stopping to answer price-shoppers pulls you away from billable work.
        </p>
      </FadeUp>

      {/* Clean, spacious editorial cards — no badges, no clutter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 w-full text-left">
        {OPERATOR_VERTICALS.map((item, index) => (
          <FadeUp
            key={item.title}
            delay={0.15 + index * 0.1}
            y={24}
            className="p-8 sm:p-10 rounded-3xl bg-neutral-900/60 border border-white/[0.08] hover:border-sky-400/30 transition-all hover:bg-neutral-900/80 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between group"
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                {item.title}
              </h3>

              <p className="mt-4 text-sm sm:text-[15px] leading-relaxed text-neutral-400 group-hover:text-neutral-300 transition-colors">
                {item.description}
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.06]">
              <p className="text-xs font-medium text-sky-400/90 tracking-wide">
                {item.highlight}
              </p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}
