interface BrandLogoImageProps {
  isOnDark?: boolean;
  className?: string;
}

export function BrandLogoImage({ isOnDark = false, className = 'h-10 sm:h-11' }: BrandLogoImageProps) {
  return (
    // The wordmark ends at pixel 613; crop the embedded .pro suffix from both variants.
    <span className={`relative block aspect-[613/158] shrink-0 overflow-hidden ${className}`}>
      <img
        src={isOnDark ? '/images/logo-on-dark.webp' : '/images/logo.webp'}
        alt="Invent Tomorrow"
        width={720}
        height={158}
        decoding="async"
        draggable={false}
        className="absolute left-0 top-0 h-full w-auto max-w-none"
      />
    </span>
  );
}
