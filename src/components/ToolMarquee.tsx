import type { Tool } from '../content/tools';
import { ToolLogo } from './ToolLogo';

interface ToolListProps {
  tools: Tool[];
  // The second copy only exists to make the loop seamless, so screen readers skip it
  isCopy?: boolean;
}

function ToolList({ tools, isCopy = false }: ToolListProps) {
  return (
    <ul
      aria-hidden={isCopy || undefined}
      className={`flex min-w-[100vw] shrink-0 items-center justify-around gap-0 pr-0 motion-reduce:min-w-0 motion-reduce:flex-wrap motion-reduce:justify-center ${
        isCopy ? 'motion-reduce:hidden' : ''
      }`}
    >
      {tools.map((tool) => (
        <li
          key={tool.name}
          className="flex shrink-0 items-center gap-3 whitespace-nowrap border border-border bg-paper px-8 py-5 font-display text-lg font-semibold text-primary"
        >
          <ToolLogo tool={tool} />
          {tool.name}
        </li>
      ))}
    </ul>
  );
}

// A looping slider of every tool. It pauses under the pointer, and wraps into a centred list for reduced motion.
export function ToolMarquee({ tools }: { tools: Tool[] }) {
  return (
    <div className="overflow-hidden py-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="flex w-max motion-safe:animate-marquee motion-safe:hover:[animation-play-state:paused] motion-reduce:w-full motion-reduce:px-6">
        <ToolList tools={tools} />
        <ToolList tools={tools} isCopy />
      </div>
    </div>
  );
}
