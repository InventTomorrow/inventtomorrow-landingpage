import { useInView } from 'motion/react';
import { useRef, useState } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { TIMELINE_MILESTONES, type TimelineMilestone } from '../utils/timeline';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import styles from './TimelineSection.module.css';

// The part already typed is visible; the rest is invisible but still takes up room, so nothing shifts while it types.
function Typed({ text, count, isTyping }: { text: string; count: number; isTyping: boolean }) {
  return (
    <>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      {isTyping && <span className={styles.caret} aria-hidden="true" />}
      <span className={styles.pending} aria-hidden="true">{text.slice(count)}</span>
    </>
  );
}

interface StepProps {
  step: TimelineMilestone;
  index: number;
  isLast: boolean;
  // Steps before this number have finished typing; this one types when it is reached.
  activeIndex: number;
  onDone: () => void;
}

function Step({ step, index, isLast, activeIndex, onDone }: StepProps) {
  const isActive = activeIndex >= index;
  const [isTimeDone, setIsTimeDone] = useState(false);
  const timeCount = useTypewriter(step.time, isActive, 25, () => setIsTimeDone(true));
  const descriptionCount = useTypewriter(step.description, isTimeDone, 6, onDone);
  const isDescriptionDone = descriptionCount >= step.description.length;

  return (
    <li className={styles.step} data-active={isActive}>
      <time dateTime={`14:${step.time.split(':')[1]}`} className={styles.time} aria-label={step.time}>
        <Typed text={step.time} count={timeCount} isTyping={isActive && !isTimeDone} />
      </time>
      <span className={styles.marker} aria-hidden="true" />
      <p className={styles.description} aria-label={step.description}>
        <Typed text={step.description} count={descriptionCount} isTyping={isTimeDone && !isDescriptionDone} />
      </p>
      {!isLast && <span className={styles.segment} data-filled={activeIndex > index} aria-hidden="true" />}
    </li>
  );
}

export function TimelineSection() {
  const listRef = useRef<HTMLOListElement>(null);
  const isInView = useInView(listRef, { once: true, amount: 0.5 });
  // The number of steps that have finished typing; the next one types when the list is on screen.
  const [done, setDone] = useState(0);
  const activeIndex = isInView ? done : -1;

  return (
    <section id="stay-focused" aria-label="Stay focused" className={`${styles.section} section-y px-6 sm:px-12`}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Stay focused"
          title={<>It's 2:14 pm. <span className="text-accent">You're on a job.</span></>}
        />

        <ol ref={listRef} className={styles.timeline}>
          {TIMELINE_MILESTONES.map((step, index) => (
            <Step
              key={step.id}
              step={step}
              index={index}
              isLast={index === TIMELINE_MILESTONES.length - 1}
              activeIndex={activeIndex}
              onDone={() => setDone((current) => Math.max(current, index + 1))}
            />
          ))}
        </ol>

        <FadeUp delay={0.3} y={16}>
          <p className={styles.closing}>
            You stay focused. <span className="font-normal text-body">The opportunity keeps moving.</span>
          </p>
        </FadeUp>
      </div>
    </section>
  );
}
