import { BadgeCheck, CalendarClock, CalendarSync, Clock, MessageSquareReply, MessageSquareText, Repeat, Send, SprayCan, Star } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { FocusColumn, type FocusItem } from './FocusColumn';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { SiteImage } from './SiteImage';
import { WaveLines } from './WaveLines';

const YOUR_PART: FocusItem[] = [
  { title: 'Join one 45-minute kickoff call', text: 'We learn your prices, services and service area.', time: '45 min', icon: CalendarClock },
  { title: 'Approve your messages once', text: "Nothing goes out until you've read it.", time: 'Once', icon: BadgeCheck },
  { title: 'Deliver great cleaning work', text: "That's it. We take it from here.", time: 'Every day', icon: SprayCan },
];

const OUR_PART: FocusItem[] = [
  { title: 'Connect your calendar and phone', icon: CalendarSync },
  { title: 'Write every message in your voice', icon: MessageSquareText },
  { title: 'Text back every missed call', icon: MessageSquareReply },
  { title: 'Follow up on every quote', icon: Send },
  { title: 'Request a review after every clean', icon: Star },
  { title: 'Rebook past clients', icon: Repeat },
];

// Your focus on the left, our system on the right, with the cleaning workflow illustration and a "VS" badge between them.
export function DoneForYouSection() {
  return (
    <section id="done-for-you" className="relative z-10 w-full overflow-hidden bg-paper section-y px-6 sm:px-12">
      <WaveLines className="-right-24 bottom-0 h-96 w-[44rem] opacity-70" />
      <div className="relative mx-auto max-w-7xl">
        <SectionHeading
          eyebrow="Done for you"
          title="You focus on the clean."
          titleMuted="We handle the follow-up."
          subtitle="A clear split of responsibilities so nothing gets missed and nothing pulls you away from the job."
        />

        <div className="mt-16 grid items-start gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)] lg:gap-10">
          <Reveal variant="left" distance={40}>
            <FocusColumn
              side="left"
              eyebrow="Your focus"
              title="About 1 hour"
              badge={
                <>
                  <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
                  Total, once
                </>
              }
              items={YOUR_PART}
            />
          </Reveal>

          <Reveal variant="zoom" className="relative mx-auto w-full max-w-xs pb-8 lg:self-center">
            <SiteImage
              src="/images/done-for-you.webp"
              alt="A cleaner focused on the job while automated workflows handle customer messages."
              label="Done-for-you image"
              width={800}
              height={1021}
              className="rounded-2xl object-contain!"
            />
            <span
              className="absolute bottom-0 left-1/2 flex size-16 -translate-x-1/2 items-center justify-center rounded-full bg-accent font-display text-xl font-bold text-on-primary ring-8 ring-paper"
              aria-hidden="true"
            >
              VS
            </span>
          </Reveal>

          <Reveal variant="right" distance={40}>
            <FocusColumn
              side="right"
              eyebrow="Our system"
              title="Everything else"
              badge={
                <>
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60 motion-reduce:hidden" />
                    <span className="relative inline-flex size-2 rounded-full bg-accent" />
                  </span>
                  Running day and night
                </>
              }
              items={OUR_PART}
              isFilled
            />
          </Reveal>
        </div>

        <FadeUp delay={0.15} y={14} className="mt-14 text-center">
          <p className="font-display text-xl font-semibold text-primary sm:text-2xl">
            You stay present on the job. <span className="text-accent">Every opportunity keeps moving.</span>
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
