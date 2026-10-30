const SHAPES = {
  'dots-grid': { src: '/graphics/dots-grid.webp', width: 62, height: 62 },
  swirl: { src: '/graphics/swirl.webp', width: 885, height: 1040 },
} as const;

export type GraphicShapeName = keyof typeof SHAPES;

interface GraphicShapeProps {
  name: GraphicShapeName;
  // Position, size and opacity, e.g. "right-[6%] top-12 h-14 w-14 opacity-60"
  className?: string;
}

// Purely decorative image that sits behind the section's content.
export function GraphicShape({ name, className = '' }: GraphicShapeProps) {
  const { src, width, height } = SHAPES[name];
  return (
    <img
      src={src}
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`pointer-events-none absolute -z-10 select-none ${className}`}
    />
  );
}
