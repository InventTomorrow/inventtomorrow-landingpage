import { FileText, Moon, PhoneCall, Repeat, Star, type LucideIcon } from 'lucide-react';
import { ChangeRow } from './ChangeRow';
import { SectionHeading } from './SectionHeading';
import { Stagger } from './Stagger';

const CHANGES: { icon: LucideIcon; before: string; after: string }[] = [
  { icon: PhoneCall, before: 'Stop work for calls', after: 'Every caller gets a reply' },
  { icon: FileText, before: 'Chase quotes', after: 'Quotes get followed up' },
  { icon: Moon, before: 'Late night texts', after: 'Your evenings are free' },
  { icon: Star, before: 'Ask for reviews', after: 'Reviews requested after jobs' },
  { icon: Repeat, before: 'Remember rebookings', after: 'Repeat cleans encouraged' },
];

// A before/after table: the old way struck through, the new way beside it.
export function BeforeAfterSection() {
  return (
    <section id="before-after" className="relative z-10 w-full overflow-hidden bg-stone section-y px-6 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Before and after"
          title="More time cleaning."
          titleMuted="Less time managing."
          subtitle="Keep cleaning while calls, quotes, and follow ups get handled. More booked jobs, less stress, and more time for yourself."
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
