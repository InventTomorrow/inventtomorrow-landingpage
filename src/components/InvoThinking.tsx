import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { stageLabel, THINKING_STEPS, thinkingStage } from '../utils/thinking';
import styles from './InvoThinking.module.css';

// Shown while Invo prepares a reply: reading → understanding → thinking → typing.
// While waiting it follows the clock; once the reply is in, the chat drives it
// (`forcedStep`) so a fast reply flashes through the stages it skipped.
export function InvoThinking({ replyReady, forcedStep, expectedMs }: { replyReady: boolean; forcedStep: number | null; expectedMs: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Date.now() - start), 200);
    return () => clearInterval(timer);
  }, []);
  const { step, label } = forcedStep !== null && !replyReady
    ? { step: forcedStep, label: stageLabel(forcedStep) } : thinkingStage(elapsed, replyReady, expectedMs);

  return (
    <div role="status" className={styles.bubble}>
      {/* Screen readers hear this once, not every stage change. */}
      <span className="sr-only">Invo is preparing a reply</span>
      <span className={styles.orb} aria-hidden="true">
        <Sparkles strokeWidth={2.25} />
      </span>
      <span className={styles.body} aria-hidden="true">
        <span className={styles.labelRow}>
          <span key={label} className={styles.label}>{label}</span>
          <span className={styles.dots}><span /><span /><span /></span>
        </span>
        <span className={styles.steps}>
          {THINKING_STEPS.map((name, index) => (
            <span key={name} className={styles.step} data-state={index < step ? 'done' : index === step ? 'active' : 'todo'} />
          ))}
        </span>
      </span>
    </div>
  );
}
