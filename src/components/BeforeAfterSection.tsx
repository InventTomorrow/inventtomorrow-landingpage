import { FileText, Moon, PhoneCall, Repeat, Star, type LucideIcon } from 'lucide-react';
import { ChangeRow } from './ChangeRow';
import { SectionHeading } from './SectionHeading';
import { Stagger } from './Stagger';

const CHANGES: { icon: LucideIcon; before: string; after: string }[] = [
  { icon: PhoneCall, before: 'Stop during a job to answer calls', after: 'Keep cleaning while every caller gets a reply' },
  { icon: FileText, before: 'Chase quotes between jobs', after: 'Every quote gets followed up automatically' },
  { icon: Moon, before: 'You text customers at 10pm', after: 'Your evenings are yours again' },
  { icon: Star, before: 'Ask for reviews manually', after: 'Review requests go out after every clean' },
  { icon: Repeat, before: 'Remember who needs rebooking', after: 'Regulars are prompted to book again' },
];

// A before/after table: the old way struck through, the new way beside it.
export function BeforeAfterSection() {
  return (
    <section id="before-after" className="relative z-10 w-full overflow-hidden border-t border-border bg-fade-stone section-y px-6 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Before and after"
          title="What changes"
          titleMuted="in your week"
          subtitle="Calls, quotes and follow-ups keep pulling you away from the work. The system keeps every opportunity moving while you stay focused on the clean."
        />

        <div className="mt-14">
          <div className="hidden grid-cols-[1fr_auto_1fr] gap-10 pb-4 text-sm font-semibold uppercase lg:grid" aria-hidden="true">
            <span className="text-right text-body">Before</span>
            <span className="w-12" />
            <span className="text-accent">After</span>
          </div>
          <Stagger as="ul" gap={0.12} className="border-b border-border">
            {CHANGES.map((change) => (
              <ChangeRow key={change.before} {...change} />
            ))}
          </Stagger>
        </div>

      </div>
    </section>
  );
}
