import { m, useReducedMotion, useScroll, useTransform } from 'motion/react';
import { useRef, type ReactNode } from 'react';

interface ParallaxBandProps {
  // Scrolls over the pinned picture
  children: ReactNode;
  // Path under /public. Leave out to show a placeholder until the real picture is added.
  imageSrc?: string;
  imageAlt: string;
  id?: string;
}

const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;

// A full-width band. The picture stays pinned to the screen while the text scrolls up over it; once the text has passed, the
// picture scrolls away. The picture also zooms in slowly as you go. A navy tint keeps white text readable on any photo.
export function ParallaxBand({ children, imageSrc, imageAlt, id }: ParallaxBandProps) {
  const bandRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: bandRef, offset: ['start end', 'end start'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  return (
    <section ref={bandRef} id={id} className="relative z-10 w-full">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-navy-glow" aria-hidden="true">
        <m.div className="absolute inset-0" style={prefersReducedMotion ? undefined : { scale }}>
          {imageSrc ? (
            <img src={imageSrc} alt="" width={IMAGE_WIDTH} height={IMAGE_HEIGHT} loading="lazy" decoding="async" className="h-full w-full object-cover" />
          ) : (
            <div role="img" aria-label={`${imageAlt} (image to be added)`} className="h-full w-full bg-accent-soft" />
          )}
        </m.div>
        <div className="absolute inset-0 bg-primary/65" />
        {!imageSrc && (
          <p className="absolute bottom-6 left-6 text-xs text-white/60 sm:left-12">
            Pinned background image · {IMAGE_WIDTH} × {IMAGE_HEIGHT} px
          </p>
        )}
      </div>

      <div className="relative z-10 -mt-[100svh] px-6 sm:px-12">{children}</div>
    </section>
  );
}
