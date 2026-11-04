import { Phone } from 'lucide-react';
import { Link } from 'react-router';
import { BOOKING_PATH } from '../utils/navigation';
import { CtaButton } from './CtaButton';
import { Reveal } from './Reveal';
import { SectionHeading } from './SectionHeading';
import { SiteImage } from './SiteImage';
import { WaveLines } from './WaveLines';

const POINTS = [
  'Done for you',
  'You approve every message',
  'Runs every day',
  'Free 15-minute audit call',
  'Works with your current tools',
  'No contract',
];

// Who we are: two photos with a guarantee badge on the left, the short story and a checklist on the right.
export function AboutIntroSection() {
  return (
    <section id="about" className="relative z-10 w-full bg-paper px-6 pb-16 pt-16 sm:px-12 sm:pb-20 sm:pt-20">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <Reveal variant="left" distance={48} className="relative mx-auto w-full max-w-xl pb-16 sm:pb-24">
          <WaveLines className="-left-24 -top-10 -z-10 h-[120%] w-[140%]" />
          <div className="absolute -left-5 top-6 hidden flex-col gap-3 sm:flex" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} className="size-2 rounded-full bg-accent" />
            ))}
          </div>
          <div className="w-[58%]">
            <SiteImage alt="Our team at work" label="About image 1" width={400} height={520} className="rounded-2xl" />
          </div>
          <div className="absolute bottom-0 right-0 w-[54%]">
            <SiteImage alt="A tidy, finished clean" label="About image 2" width={400} height={560} className="rounded-2xl" />
          </div>
          <div className="absolute left-[41%] top-[34%] flex size-28 flex-col items-center justify-center rounded-full border-8 border-paper bg-accent text-center text-on-primary sm:size-44">
            <span className="font-display text-4xl font-semibold leading-none sm:text-6xl">90</span>
            <span className="mt-1 text-[0.625rem] font-medium uppercase sm:text-sm">Day guarantee</span>
          </div>
        </Reveal>

        <div>
          <SectionHeading
            align="left"
            eyebrow="About us"
            title="We build simple systems" titleMuted="that help cleaning businesses grow"
            subtitle="We’re Invent Tomorrow, a team that works with cleaning businesses to solve everyday challenges and build simpler ways to work."
          />

          <Reveal variant="right" distance={32} delay={0.15}>
            <ul className="mt-8 grid gap-x-8 gap-y-3 rounded-2xl border-l-4 border-accent bg-stone p-6 sm:grid-cols-2 sm:p-8">
              {POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 font-display text-base font-medium text-primary">
                  <span className="size-2.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
              <CtaButton size="lg" to="/about">
                More about us
              </CtaButton>
              <Link to={BOOKING_PATH} className="group flex items-center gap-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
                <span className="flex size-14 items-center justify-center rounded-full bg-accent text-on-primary transition-colors duration-300 group-hover:bg-primary">
                  <Phone className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="flex flex-col text-sm">
                  Have a question?
                  <span className="font-display text-lg font-semibold text-primary">Schedule a call</span>
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
