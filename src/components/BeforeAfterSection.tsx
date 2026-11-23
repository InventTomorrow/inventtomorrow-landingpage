import { ChangeRow } from './ChangeRow';
import { SectionHeading } from './SectionHeading';

const CHANGES: { before: string; after: string }[] = [
  { before: 'Missed calls go to voicemail', after: 'Every missed call gets a reply in seconds' },
  { before: 'Quotes go quiet', after: 'Every quote gets followed up' },
  { before: 'Old quotes sit in a spreadsheet', after: 'Old quotes become booked jobs' },
  { before: 'One time clients disappear', after: 'One time clients become regulars' },
  { before: 'Reviews when you remember', after: 'A review request after every clean' },
];

// A text-first comparison: paired on phones, two aligned columns on wider screens.
export function BeforeAfterSection() {
  return (
    <section id="before-after" className="relative z-10 w-full bg-stone section-y px-6 sm:px-12">
      <div className="mx-auto max-w-5xl">
        <SectionHeading
          eyebrow="Before and after"
          size="compact"
          title="Same leads."
          titleMuted="More booked jobs."
        />

        <div className="mt-8 sm:mt-10">
          <div className="hidden grid-cols-2 gap-10 pb-4 text-xs font-semibold uppercase tracking-wide sm:grid" aria-hidden="true">
            <span className="text-body">Before</span>
            <span className="text-accent">After</span>
          </div>
          <ul className="border-b border-border">
            {CHANGES.map((change) => (
              <ChangeRow key={change.before} {...change} />
            ))}
          </ul>
        </div>

      </div>
    </section>
  );
}
