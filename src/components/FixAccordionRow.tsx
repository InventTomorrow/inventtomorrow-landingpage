import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Fix } from '../content/fixes';
import { ROW_HEADER_ATTRIBUTE } from '../hooks/useScrollAccordion';
import { FixStage } from './FixStage';

interface FixAccordionRowProps {
  fix: Fix;
  index: number;
  isActive: boolean;
  // False until the stack is on screen, so the example plays in front of the visitor
  hasStarted: boolean;
  onSelect: () => void;
}

// Heights come from --row-h and --panel-h on the stack, which the scroll maths also reads.
export function FixAccordionRow({ fix, index, isActive, hasStarted, onSelect }: FixAccordionRowProps) {
  const [hasOpened, setHasOpened] = useState(false);
  const Icon = fix.icon;
  const panelId = `fix-panel-${index}`;

  // Once an example has played it stays mounted, so opening the row again doesn't replay it.
  useEffect(() => {
    if (isActive && hasStarted) setHasOpened(true);
  }, [isActive, hasStarted]);

  return (
    <li className="relative after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-linear-to-r after:from-transparent after:via-ink/20 after:to-transparent">
      <h3>
        <button
          type="button"
          {...{ [ROW_HEADER_ATTRIBUTE]: '' }}
          aria-expanded={isActive}
          aria-controls={panelId}
          onClick={onSelect}
          className="spotlight flex h-(--row-h) w-full cursor-pointer items-center gap-4 px-4 text-left sm:gap-5 sm:px-6"
        >
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-drop transition-colors duration-500 ${
              isActive ? 'bg-accent text-white' : 'bg-accent-soft text-accent'
            }`}
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <span
            className={`min-w-0 flex-1 text-xl font-semibold tracking-tight transition-colors duration-500 sm:text-2xl ${
              isActive ? 'text-ink' : 'text-ink/60'
            }`}
          >
            {fix.title}
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-ink/40 transition-transform duration-500 ${isActive ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </h3>

      <div
        id={panelId}
        inert={!isActive}
        className={`overflow-hidden transition-[height,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          isActive ? 'h-(--panel-h) opacity-100' : 'h-0 opacity-0'
        }`}
      >
        <div className="flex h-(--panel-h) flex-col gap-4 px-4 pb-8 sm:px-6">
          <p className="text-base text-muted sm:pl-17 sm:text-lg">{fix.text}</p>
          {hasOpened && <FixStage fix={fix} />}
        </div>
      </div>
    </li>
  );
}
