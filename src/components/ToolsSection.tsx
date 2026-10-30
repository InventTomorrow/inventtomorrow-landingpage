import { Calendar, CreditCard, Database, Phone, Star } from 'lucide-react';
import { useState } from 'react';
import { AUDIT_PATH } from '../utils/navigation';
import { FadeUp } from './FadeUp';
import { ToolsHubScene } from './illustrations/ToolsHubScene';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';

const TOOL_CATEGORIES = [
  { category: 'Booking and scheduling', tools: ['Jobber', 'Housecall Pro'], icon: Calendar },
  { category: 'Calls and texts', tools: ['Your business line', 'OpenPhone'], icon: Phone },
  { category: 'Payments and invoicing', tools: ['Stripe', 'QuickBooks'], icon: CreditCard },
  { category: 'Reviews', tools: ['Google Business Profile'], icon: Star },
  { category: 'CRM and leads', tools: ['HubSpot', 'Google Sheets'], icon: Database },
];

export function ToolsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="tools" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-stone section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Works with your tools"
          title="Built around the tools you already use"
          subtitle="No new software to learn. We plug into your booking, calling and review tools and run the follow-up on top."
        />

        <div className="mt-14 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
          <FadeUp delay={0.1} y={18} className="mx-auto w-full max-w-md">
            <div className="aspect-[6/5] w-full rounded-[2rem] border border-ink/[0.06] bg-white p-4 shadow-card">
              <ToolsHubScene activeIndex={activeIndex} />
            </div>
          </FadeUp>

          <FadeUp delay={0.15} y={18} className="overflow-hidden rounded-2xl border border-ink/[0.08] bg-white">
            <ul onMouseLeave={() => setActiveIndex(0)}>
              {TOOL_CATEGORIES.map(({ category, tools, icon: Icon }, index) => (
                <li
                  key={category}
                  onMouseEnter={() => setActiveIndex(index)}
                  onFocus={() => setActiveIndex(index)}
                  tabIndex={0}
                  className={`spotlight flex cursor-default flex-col gap-3 border-b border-ink/[0.07] px-6 py-5 outline-none transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between ${
                    activeIndex === index ? 'bg-accent-soft/50' : ''
                  }`}
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
      </div>
    </section>
  );
}
