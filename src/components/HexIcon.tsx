import type { LucideIcon } from 'lucide-react';
import type { Ref } from 'react';
import { getRoundedHexagonPath } from '../utils/roundedHexagon';

const WIDTH = 93;
const HEIGHT = 100;
const HEXAGON_PATH = getRoundedHexagonPath(WIDTH, HEIGHT, 9, 1.5);

interface HexIconProps {
  icon: LucideIcon;
  // A lighter outline, for rows of steps
  isSoft?: boolean;
  // Sets the width; the height follows
  sizeClassName?: string;
  className?: string;
  ref?: Ref<HTMLSpanElement>;
}

// An icon inside a white, softly rounded hexagon with a 2px blue outline on every side.
export function HexIcon({ icon: Icon, isSoft = false, sizeClassName = 'w-24', className = '', ref }: HexIconProps) {
  return (
    <span ref={ref} className={`relative flex aspect-[93/100] shrink-0 items-center justify-center ${sizeClassName} ${className}`} aria-hidden="true">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 h-full w-full overflow-visible drop-shadow-md">
        <path
          d={HEXAGON_PATH}
          className={`fill-paper ${isSoft ? 'stroke-accent/70' : 'stroke-accent'}`}
          strokeWidth="2"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <Icon className="relative h-[36%] w-[36%] text-accent" strokeWidth={1.25} />
    </span>
  );
}
