// Thin flowing lines, like the contour pattern behind the reference's photo collages. Decorative only.
export function WaveLines({ className = '', isOnDark = false }: { className?: string; isOnDark?: boolean }) {
  return (
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute [mask-image:radial-gradient(closest-side,black_35%,transparent)] ${isOnDark ? 'text-white/10' : 'text-border'} ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      {Array.from({ length: 16 }, (_, index) => (
        <path key={index} d={`M-20 ${190 + index * 7} C 120 ${30 + index * 9}, 300 ${390 - index * 6}, 620 ${110 + index * 8}`} />
      ))}
    </svg>
  );
}
