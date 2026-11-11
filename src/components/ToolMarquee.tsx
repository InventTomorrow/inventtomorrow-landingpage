import { useLayoutEffect, useRef } from 'react';
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
      className={`flex shrink-0 items-center gap-0 pr-0 motion-reduce:w-full motion-reduce:flex-wrap motion-reduce:justify-center ${
        isCopy ? 'motion-reduce:hidden' : ''
      }`}
    >
      {tools.map((tool) => (
        <li
          key={tool.name}
          className="flex shrink-0 items-center gap-2.5 whitespace-nowrap border border-border bg-paper px-5 py-4 font-display text-base font-semibold text-primary sm:gap-3 sm:px-8 sm:py-5 sm:text-lg"
        >
          <ToolLogo tool={tool} />
          {tool.name}
        </li>
      ))}
    </ul>
  );
}

// Three copies keep the familiar starting tool centered and the loop seamless at every width.
export function ToolMarquee({ tools }: { tools: Tool[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const list = track?.firstElementChild;
    const featuredTool = list?.firstElementChild;
    if (!track || !list || !featuredTool) return;
    const mobile = window.matchMedia('(max-width: 39.999rem)');

    const measure = () => {
      const width = list.getBoundingClientRect().width;
      if (!width) return;
      const featuredCenter = featuredTool.getBoundingClientRect().width / 2;
      track.style.setProperty('--tools-start', `${-width - featuredCenter}px`);
      track.style.setProperty('--tools-loop-width', `${width}px`);
      track.style.setProperty('--tools-duration', `${width / (mobile.matches ? 40 : 128)}s`);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    mobile.addEventListener('change', measure);
    return () => {
      observer.disconnect();
      mobile.removeEventListener('change', measure);
    };
  }, [tools]);

  return (
    <div className="overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] sm:py-5">
      <div ref={trackRef} className="relative flex w-max motion-safe:left-1/2 motion-safe:animate-marquee motion-reduce:w-full motion-reduce:px-6">
        <ToolList tools={tools} />
        <ToolList tools={tools} isCopy />
        <ToolList tools={tools} isCopy />
      </div>
    </div>
  );
}
