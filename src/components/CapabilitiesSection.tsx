import { FadeUp } from './FadeUp';
import { PhoneForwarded, MessageSquareCode, CalendarClock, ShieldCheck } from 'lucide-react';

const CAPABILITIES = [
  {
    icon: PhoneForwarded,
    title: 'Missed Call Text-Back',
    description:
      'The moment an incoming call goes unanswered, an intelligent conversational SMS initiates in under 5 seconds, answering questions and holding the caller’s attention.',
    accent: '#60A5FA',
  },
  {
    icon: MessageSquareCode,
    title: 'Autonomous Lead Qualification',
    description:
      'Gathers square footage, service scope, urgency, and property address through natural dialogue so you receive ready-to-book opportunities.',
    accent: '#818CF8',
  },
  {
    icon: CalendarClock,
    title: 'Real-Time Schedule Sync',
    description:
      'Integrates directly with your calendar and dispatch software. Customers select confirmed time slots that automatically fit your crew routing.',
    accent: '#F472B6',
  },
  {
    icon: ShieldCheck,
    title: 'Automated Quote Nurturing',
    description:
      'Diligently follows up with pending estimates at calibrated intervals until quotes are accepted and job deposits are secured.',
    accent: '#F59E0B',
  },
];

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      className="relative z-10 w-full section-y section-deco px-6 sm:px-12 max-w-6xl mx-auto flex flex-col items-center text-center"
    >
      <FadeUp delay={0.1} y={16}>
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-blue-400 font-mono">
          System Capabilities
        </span>
      </FadeUp>

      <FadeUp delay={0.2} y={24}>
        <h2 className="mt-4 text-3xl sm:text-5xl font-bold tracking-tight text-white max-w-2xl leading-tight">
          Autonomous Systems That Work While You Do.
        </h2>
      </FadeUp>

      <FadeUp delay={0.3} y={20}>
        <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto leading-relaxed">
          Stop losing thousands in missed opportunities every month. Our end-to-end automation handles the busywork so you stay in the flow.
        </p>
      </FadeUp>

      {/* Spacious 2x2 grid — clean cards with rich specular borders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 w-full text-left">
        {CAPABILITIES.map((item, index) => {
          const Icon = item.icon;
          return (
            <FadeUp
              key={item.title}
              delay={0.15 + index * 0.1}
              y={24}
              className="p-8 sm:p-10 rounded-3xl bg-neutral-900/60 border border-white/[0.08] hover:border-white/20 transition-all hover:bg-neutral-900/80 shadow-[0_12px_40px_rgba(0,0,0,0.4)] flex flex-col justify-between group"
            >
              <div>
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/[0.04] border border-white/10 mb-6 group-hover:scale-105 transition-transform"
                  style={{ color: item.accent }}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm sm:text-[15px] leading-relaxed text-neutral-400 group-hover:text-neutral-300 transition-colors">
                  {item.description}
                </p>
              </div>
            </FadeUp>
          );
        })}
      </div>
    </section>
  );
}
