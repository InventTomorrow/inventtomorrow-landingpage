import { TOOLS } from '../content/tools';
import { AUDIT_PATH } from '../utils/navigation';
import { FadeUp } from './FadeUp';
import { TextLink } from './TextLink';
import { ToolMarquee } from './ToolMarquee';

// The tools we plug into: a title between two lines, then a slider of logos in bordered cells.
// It overlaps the hero's curve so the title sits under the curve in the first screen and the text below it starts off-screen.
export function ToolsSection() {
  return (
    <section id="tools" className="relative z-10 -mt-10 w-full px-6 pb-16 sm:px-12 sm:pb-20">
      <div className="mx-auto max-w-7xl">
        <FadeUp y={12} className="flex items-center gap-6">
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
          <h2 className="text-center text-xl font-semibold text-primary sm:text-2xl">Built around the tools you already use</h2>
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </FadeUp>
        <FadeUp delay={0.05} y={12}>
          <p className="mx-auto mt-4 max-w-xl text-center text-base">
            No new software to learn. We plug into your booking, calling and review tools and run the follow-up on top.
          </p>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-10">
          <ToolMarquee tools={TOOLS} />
        </FadeUp>

        <FadeUp delay={0.1} y={12} className="mt-6 flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-center sm:gap-4">
          <p className="text-sm">Don't see yours? We confirm compatibility in your audit.</p>
          <TextLink to={AUDIT_PATH} className="text-sm">
            Check my tools
          </TextLink>
        </FadeUp>
      </div>
    </section>
  );
}
