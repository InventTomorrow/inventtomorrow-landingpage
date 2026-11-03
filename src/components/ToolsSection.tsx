import { motion } from 'motion/react';
import { useRef } from 'react';
import { TOOL_CATEGORIES } from '../content/tools';
import { useDirectionalReveal } from '../hooks/useDirectionalReveal';
import { getFanOutStart } from '../utils/fanOut';
import { AUDIT_PATH } from '../utils/navigation';
import { getRowDelay } from '../utils/stagger';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';
import { ToolLogo } from './ToolLogo';

const ROW_OFFSET = 28;
const CHIP_LEAD_SECONDS = 0.35;
const CHIP_STAGGER_SECONDS = 0.12;
const EASE = [0.22, 1, 0.36, 1] as const;

export function ToolsSection() {
  const listRef = useRef<HTMLUListElement>(null);
  const { isVisible, direction } = useDirectionalReveal(listRef);
  const rowCount = TOOL_CATEGORIES.length;
  // Scrolling down, rows rise in from below and leave upward; scrolling up, the other way round.
  const enterFromY = direction === 'down' ? ROW_OFFSET : -ROW_OFFSET;
  const leaveToY = -enterFromY;

  return (
    <section id="tools" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-stone section-y section-deco px-6 sm:px-12">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Works with your tools"
          title="Built around the tools you already use"
          subtitle="No new software to learn. We plug into your booking, calling and review tools and run the follow-up on top."
        />

        <ul ref={listRef} className="mx-auto mt-14 max-w-3xl divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
          {TOOL_CATEGORIES.map(({ category, tools, icon: Icon }, index) => (
            <motion.li
              key={category}
              initial={false}
              animate={
                isVisible
                  ? {
                      opacity: 1,
                      y: [enterFromY, 0],
                      transition: { duration: 0.65, delay: getRowDelay(index, rowCount, direction), ease: EASE },
                    }
                  : {
                      opacity: 0,
                      y: leaveToY,
                      transition: { duration: 0.3, delay: getRowDelay(index, rowCount, direction, 0.04), ease: EASE },
                    }
              }
              className="spotlight flex items-center gap-4 px-4 py-6 sm:gap-7 sm:px-6 sm:py-8"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-drop bg-accent-soft text-accent sm:h-[4.5rem] sm:w-[4.5rem]">
                <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} />
              </span>
              <span className="w-px self-stretch bg-gradient-to-b from-transparent via-ink/25 to-transparent" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold tracking-tight text-ink">{category}</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {tools.map((tool, toolIndex) => {
                    // Once its row is in, each tool slides out from behind the first one.
                    const start = getFanOutStart(toolIndex, tools.length, tools.length, CHIP_STAGGER_SECONDS);
                    const delay = getRowDelay(index, rowCount, direction) + CHIP_LEAD_SECONDS + start.delay;
                    return (
                      <motion.li
                        key={tool.name}
                        initial={false}
                        animate={
                          isVisible
                            ? { opacity: 1, x: '0%', scale: 1, transition: { duration: 0.7, delay, ease: EASE } }
                            : { opacity: 0, x: `${start.fromX}%`, scale: 0.9, transition: { duration: 0.25 } }
                        }
                        style={{ position: 'relative', zIndex: start.layer }}
                        className="flex items-center gap-2 rounded-full border border-ink/[0.08] bg-white py-1.5 pl-1.5 pr-3.5 text-sm text-ink/80"
                      >
                        <ToolLogo tool={tool} />
                        {tool.name}
                      </motion.li>
                    );
                  })}
                </ul>
              </div>
            </motion.li>
          ))}
        </ul>

        <FadeUp delay={0.1} y={12} className="mt-8 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-4">
          <p className="text-sm text-muted">Don't see yours? We confirm compatibility in your audit.</p>
          <TextLink to={AUDIT_PATH} className="text-sm">
            Check my tools
          </TextLink>
        </FadeUp>
      </div>
    </section>
  );
}
