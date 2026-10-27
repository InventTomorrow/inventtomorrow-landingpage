import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';
import { AUDIT_PATH } from '../utils/navigation';
import { Calendar, Phone, CreditCard, Star, Database } from 'lucide-react';

const TOOL_CATEGORIES = [
  { category: 'Booking and scheduling', tools: ['Jobber', 'Housecall Pro'], icon: Calendar },
  { category: 'Calls and texts', tools: ['Your business line', 'OpenPhone'], icon: Phone },
  { category: 'Payments and invoicing', tools: ['Stripe', 'QuickBooks'], icon: CreditCard },
  { category: 'Reviews', tools: ['Google Business Profile'], icon: Star },
  { category: 'CRM and leads', tools: ['HubSpot', 'Google Sheets'], icon: Database },
];

export function ToolsSection() {
  return (
    <section id="tools" className="relative z-10 w-full border-t border-ink/[0.06] bg-stone px-6 py-24 sm:px-12 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Works with your tools"
          title="Built around the tools you already use"
          subtitle="No new software to learn. We plug into your booking, calling and review tools and run the follow-up on top."
        />

        <FadeUp delay={0.15} y={18} className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-2xl border border-ink/[0.08] bg-white">
          <ul>
            {TOOL_CATEGORIES.map(({ category, tools, icon: Icon }) => (
              <li
                key={category}
                className="spotlight flex flex-col gap-3 border-b border-ink/[0.07] px-6 py-5 transition-colors duration-300 hover:bg-[#626262]/[0.03] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0 text-accent" />
                  <span className="text-sm font-medium text-ink">{category}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tools.map((tool) => (
                    <span key={tool} className="rounded-full bg-stone px-3 py-1 text-sm text-ink/80">
                      {tool}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 bg-paper px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted">Don't see yours? We confirm compatibility in your audit.</p>
            <TextLink to={AUDIT_PATH} className="self-start text-sm sm:self-auto">
              Check my tools
            </TextLink>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
