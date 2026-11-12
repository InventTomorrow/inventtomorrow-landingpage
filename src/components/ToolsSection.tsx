import { TOOLS } from '../content/tools';
import { AUDIT_PATH } from '../utils/navigation';
import { FadeUp } from './FadeUp';
import { TextLink } from './TextLink';
import { ToolMarquee } from './ToolMarquee';

// Compatibility follows the hero without overlapping its longer copy.
export function ToolsSection() {
  return (
    <section id="tools" className="relative z-10 w-full bg-stone px-6 py-8 sm:px-12 sm:pt-4 sm:pb-12">
      <div className="mx-auto max-w-7xl">
        <FadeUp y={12} className="flex items-center justify-center gap-6">
          <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />
          <h2 className="text-balance text-center text-sm font-semibold text-primary sm:text-2xl">Works inside the tools you already use</h2>
          <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden="true" />
        </FadeUp>
        <FadeUp delay={0.05} y={12}>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed sm:text-base">
            No new software to learn. We plug into your booking, phone and review tools and work your leads from there.
          </p>
        </FadeUp>

        <FadeUp delay={0.1} className="mt-5 sm:mt-7">
          <ToolMarquee tools={TOOLS} />
        </FadeUp>

        <FadeUp delay={0.1} y={12} className="mt-4 flex flex-col items-center gap-1 text-center sm:mt-6 sm:flex-row sm:justify-center sm:gap-4">
          <p className="max-w-[34ch] text-xs leading-relaxed sm:max-w-none sm:text-sm">Don't see yours? We check it on your free audit.</p>
          <TextLink to={AUDIT_PATH} className="text-sm">
            Check my tools
          </TextLink>
        </FadeUp>
      </div>
    </section>
  );
}
