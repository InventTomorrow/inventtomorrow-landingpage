import { ImageIcon } from 'lucide-react';

interface SiteImageProps {
  // Path under /public, e.g. "/images/hero.webp". Leave out to show a labelled placeholder.
  src?: string;
  alt: string;
  // Size to export the final image at, in px. Also reserves the space so the page doesn't jump.
  width: number;
  height: number;
  // Short name shown on the placeholder, e.g. "Hero image"
  label: string;
  className?: string;
  isEager?: boolean;
  // Icon only, for small thumbnails
  isCaptionHidden?: boolean;
}

// A photo, or a dimensioned placeholder until the real file is added.
export function SiteImage({ src, alt, width, height, label, className = '', isEager = false, isCaptionHidden = false }: SiteImageProps) {
  if (src) {
    return (
      <img
        src={src}
        width={width}
        height={height}
        alt={alt}
        loading={isEager ? 'eager' : 'lazy'}
        fetchPriority={isEager ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        className={`h-auto w-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`${alt} (image to be added)`}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={`flex w-full flex-col items-center justify-center gap-1.5 border border-dashed border-primary/30 bg-accent-soft p-2 text-center sm:p-4 ${className}`}
    >
      <ImageIcon className="h-7 w-7 text-accent" aria-hidden="true" />
      {!isCaptionHidden && (
        <>
          <span className="font-display text-base font-semibold text-primary">{label}</span>
          <span className="text-sm tabular-nums text-body">
            {width} × {height} px
          </span>
        </>
      )}
    </div>
  );
}
