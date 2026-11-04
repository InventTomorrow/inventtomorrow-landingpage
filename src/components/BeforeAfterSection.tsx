import { FileText, Moon, PhoneCall, Repeat, Star, Trophy, type LucideIcon } from 'lucide-react';
import { ChangeRow } from './ChangeRow';
import { CompareSlider } from './CompareSlider';
import { FadeUp } from './FadeUp';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { SiteImage } from './SiteImage';
import { Stagger } from './Stagger';

const CHANGES: { icon: LucideIcon; before: string; after: string }[] = [
  { icon: PhoneCall, before: 'Stop during a job to answer calls', after: 'Keep cleaning while every caller gets a reply' },
  { icon: FileText, before: 'Chase quotes between jobs', after: 'Every quote gets followed up automatically' },
  { icon: Moon, before: 'You text customers at 10pm', after: 'Your evenings are yours again' },
  { icon: Star, before: 'Ask for reviews manually', after: 'Review requests go out after every clean' },
  { icon: Repeat, before: 'Remember who needs rebooking', after: 'Regulars are prompted to book again' },
];

const RESULT = { before: 'Missed jobs and late nights', after: 'More booked jobs, evenings back' };

// A before/after slider on a pair of photos, then the same story line by line: old way struck through, new way beside it. No cards.
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

        <Reveal variant="zoom" className="mt-14">
          <CompareSlider
            ariaLabel="Drag to compare your week before and after the system"
            beforeLabel="Before"
            afterLabel="After"
            before={<SiteImage alt="A busy week before the system" label="Before image" width={1024} height={440} className="rounded-none" />}
            after={<SiteImage alt="A calm week with the system" label="After image" width={1024} height={440} className="h-full rounded-none" />}
          />
        </Reveal>

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

        <FadeUp delay={0.1} y={16} className="mt-12 flex flex-col items-center gap-5 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent text-on-primary">
            <Trophy className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold uppercase text-accent">Result</p>
            <p className="mt-1 font-display text-2xl font-semibold leading-tight text-primary sm:text-3xl">
              <span className="block text-body line-through decoration-primary/30 sm:inline">{RESULT.before}</span>
              <span className="mx-3 hidden text-accent sm:inline-block" aria-hidden="true">
                →
              </span>
              {RESULT.after}
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
