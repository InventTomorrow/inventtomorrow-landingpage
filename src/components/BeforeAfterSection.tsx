import { FileText, Moon, PhoneCall, Repeat, Star, Trophy, type LucideIcon } from 'lucide-react';
import { BeforeAfterRow } from './BeforeAfterRow';
import { SectionHeading } from './SectionHeading';
import { FocusScene } from './illustrations/processScenes';

const ROWS: { icon: LucideIcon; before: string; after: string; label?: string }[] = [
  { icon: PhoneCall, before: 'Stop during a job to answer calls', after: 'Keep cleaning while every caller gets a reply' },
  { icon: FileText, before: 'Chase quotes between jobs', after: 'Every quote gets followed up automatically' },
  { icon: Moon, before: 'You text customers at 10pm', after: 'Your evenings are yours again' },
  { icon: Star, before: 'Ask for reviews manually', after: 'Review requests go out after every clean' },
  { icon: Repeat, before: 'Remember who needs rebooking', after: 'Regulars are prompted to book again' },
  { icon: Trophy, before: 'Missed jobs and late nights', after: 'More booked jobs, evenings back', label: 'Result' },
];

export function BeforeAfterSection() {
  return (
    <section id="before-after" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-stone section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          scene={FocusScene}
          eyebrow="Before and after"
          title="What changes in your week"
          subtitle="Calls, quotes and follow-ups keep pulling you away from the work. The system keeps every opportunity moving while you stay focused on the clean."
        />

        <div className="mt-12">
          <div className="h-px bg-gradient-to-r from-transparent via-ink/20 to-transparent" aria-hidden="true" />
          <ul>
            {ROWS.map((row) => (
              <BeforeAfterRow key={row.before} icon={row.icon} before={row.before} after={row.after} label={row.label} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
