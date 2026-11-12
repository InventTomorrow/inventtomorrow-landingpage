import { FileText, PhoneCall, Repeat, RotateCcw, Star, type LucideIcon } from 'lucide-react';
import { ChangeRow } from './ChangeRow';
import { SectionHeading } from './SectionHeading';
import { Stagger } from './Stagger';

const CHANGES: { icon: LucideIcon; before: string; after: string }[] = [
  { icon: PhoneCall, before: 'Missed calls go to voicemail', after: 'Every missed call gets a reply in seconds' },
  { icon: FileText, before: 'Quotes go quiet', after: 'Every quote gets followed up' },
  { icon: RotateCcw, before: 'Old quotes sit in a spreadsheet', after: 'Old quotes become booked cleans' },
  { icon: Repeat, before: 'One-time clients disappear', after: 'One-time clients become regulars' },
  { icon: Star, before: 'Reviews when you remember', after: 'A review request after every clean' },
];

// A before/after table: the old way struck through, the new way beside it.
export function BeforeAfterSection() {
  return (
    <section id="before-after" className="relative z-10 w-full overflow-hidden bg-stone section-y px-6 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Before and after"
          size="compact"
          title="Same leads."
          titleMuted="More booked cleans."
        />

        <div className="mt-10">
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
