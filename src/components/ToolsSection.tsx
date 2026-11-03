import { TOOLS } from '../content/tools';
import { AUDIT_PATH } from '../utils/navigation';
import { FadeUp } from './FadeUp';
import { SectionHeading } from './SectionHeading';
import { TextLink } from './TextLink';
import { ToolMarquee } from './ToolMarquee';

export function ToolsSection() {
  return (
    <section id="tools" className="relative z-10 w-full border-t border-ink/[0.06] bg-fade-stone section-y section-deco">
      <div className="mx-auto max-w-6xl px-6 sm:px-12">
        <SectionHeading
          eyebrow="Works with your tools"
          title="Built around the tools you already use"
          subtitle="No new software to learn. We plug into your booking, calling and review tools and run the follow-up on top."
        />
      </div>

      <FadeUp className="mt-12">
        <ToolMarquee tools={TOOLS} />
      </FadeUp>

      <FadeUp
        delay={0.1}
        y={12}
        className="mx-auto mt-8 flex max-w-6xl flex-col items-center gap-2 px-6 text-center sm:flex-row sm:justify-center sm:gap-4 sm:px-12"
      >
        <p className="text-sm text-muted">Don't see yours? We confirm compatibility in your audit.</p>
        <TextLink to={AUDIT_PATH} className="text-sm">
          Check my tools
        </TextLink>
      </FadeUp>
    </section>
  );
}
