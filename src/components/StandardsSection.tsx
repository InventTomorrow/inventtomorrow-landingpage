import { CheckCheck, Target, Users } from 'lucide-react';
import { FadeUp } from './FadeUp';
import { Stagger } from './Stagger';
import { StaggerItem } from './StaggerItem';
import styles from './StandardsSection.module.css';

const STANDARDS = [
  { number: '01', principle: 'People first', title: 'We Work Around You', text: 'Not the other way around.', icon: Users },
  { number: '02', principle: 'Solve real problems', title: "We Fix What's Slowing Your Business Down", icon: Target },
  { number: '03', principle: 'Keep it simple', title: 'We Make Work Easier', text: 'Not harder.', icon: CheckCheck },
];

export function StandardsSection() {
  return (
    <section id="our-standards" aria-labelledby="standards-heading" className="relative z-10 w-full bg-stone section-y px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <FadeUp y={12} duration={0.4} className="text-center">
          <p className="font-display text-sm font-medium uppercase text-accent">What We Believe</p>
          <h2 id="standards-heading" className="mt-2 font-display text-3xl font-semibold leading-tight tracking-display text-primary sm:text-4xl">
            Our Three Standards
          </h2>
        </FadeUp>

        <Stagger as="ol" gap={0.09} className={styles.list}>
          {STANDARDS.map(({ number, principle, title, text, icon: Icon }) => (
            <StaggerItem key={number} as="li" distance={14} duration={0.4} className={styles.item}>
              <div className={styles.standard}>
                <span className={styles.icon}>
                  <Icon size={25} strokeWidth={1.6} aria-hidden="true" />
                </span>
                <p className={styles.label}>
                  <span className={styles.number}>{number}</span>
                  <span className={styles.labelDivider} aria-hidden="true" />
                  {principle}
                </p>
                <h3 className={styles.title}>{title}</h3>
                {text && <p className={styles.description}>{text}</p>}
                <span className={styles.accent} aria-hidden="true" />
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
