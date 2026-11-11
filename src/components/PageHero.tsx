import { ReactNode } from 'react';
import { m } from 'motion/react';
import { GraphicShape } from './GraphicShape';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  // Second headline line, shown lighter
  titleMuted?: ReactNode;
  description?: ReactNode;
  children?: ReactNode; // buttons
  meta?: ReactNode; // small line under everything (blog posts)
  size?: 'default' | 'compact';
  // Optional photo behind the hero, under a navy tint, e.g. "/images/hero-services.webp" (1920 × 600 px)
  backgroundSrc?: string;
}

const ease = [0.16, 1, 0.3, 1] as const;

// The navy hero at the top of every inner page: a soft blue glow, a grid and brand drops.
export function PageHero({ eyebrow, title, titleMuted, description, children, meta, size = 'default', backgroundSrc }: PageHeroProps) {
  return (
    <section
      className={`relative z-10 flex w-full flex-col justify-center overflow-hidden bg-navy-glow px-6 sm:px-12 ${
        // Every main page's hero is the same height, whatever its copy or buttons. Compact heroes (articles, legal) size to their content.
        size === 'compact' ? '' : 'min-h-[36rem] sm:min-h-[28.5rem] lg:min-h-[32rem]'
      }`}
    >
      {backgroundSrc && (
        <img src={backgroundSrc} alt="" width={1920} height={600} decoding="async" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-25" />
      )}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute inset-0 bg-accent/15 [clip-path:polygon(0_0,34%_0,14%_100%,0_100%)]" />
        <span className="absolute inset-0 bg-accent/10 [clip-path:polygon(48%_0,62%_0,40%_100%,26%_100%)]" />
      </div>
      <div className="graphic-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        <span className="graphic-drop-outline absolute -right-[10rem] -top-[12rem] h-[40rem] w-[40rem]" />
        <span className="graphic-drop absolute -bottom-24 -left-16 h-64 w-64" />
        <span className="absolute right-[12%] bottom-[18%] h-6 w-6 rounded-drop bg-accent" />
        <GraphicShape name="swirl" className="-bottom-28 -right-10 w-[24rem] opacity-25" />
        <GraphicShape name="dots-grid" className="left-[9%] top-[34%] h-14 w-14 opacity-70" />
      </div>

      <div
        className={`relative mx-auto flex w-full max-w-4xl flex-col items-center text-center ${
          size === 'compact' ? 'py-14 sm:py-16' : 'py-16 sm:py-20 lg:py-24'
        }`}
      >
        <m.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="text-xs font-semibold text-white/75"
        >
          {eyebrow}
        </m.p>

        <m.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease }}
          className={`mt-5 font-bold leading-[1.15] tracking-display text-white text-balance select-text ${
            size === 'compact' ? 'text-3xl sm:text-4xl' : 'text-3xl sm:text-4xl xl:text-5xl'
          }`}
        >
          {title}
          {titleMuted && (
            <>
              <br />
              <span className="text-white/70">{titleMuted}</span>
            </>
          )}
        </m.h1>

        {description && (
          <m.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 text-balance"
          >
            {description}
          </m.p>
        )}

        {children && (
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row"
          >
            {children}
          </m.div>
        )}

        {meta && (
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-7 text-sm text-white/70"
          >
            {meta}
          </m.div>
        )}
      </div>
    </section>
  );
}
