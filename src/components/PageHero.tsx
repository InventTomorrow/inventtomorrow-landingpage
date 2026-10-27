import { ReactNode } from 'react';
import { motion } from 'motion/react';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  // Second headline line, shown lighter
  titleMuted?: ReactNode;
  description?: ReactNode;
  children?: ReactNode; // buttons
  meta?: ReactNode; // small line under everything (blog posts)
  size?: 'default' | 'compact';
}

const ease = [0.16, 1, 0.3, 1] as const;

// The grey hero at the top of every inner page. Same studio grey as the home video, with a soft light
// from the top right and two faint rings echoing the orb. The navbar stays see-through over it.
export function PageHero({ eyebrow, title, titleMuted, description, children, meta, size = 'default' }: PageHeroProps) {
  return (
    <section data-dark-hero className="page-hero relative z-10 w-full overflow-hidden px-6 pt-[4.75rem] sm:px-12">
      <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
        <span className="absolute -right-[12rem] -top-[14rem] h-[44rem] w-[44rem] rounded-full border border-white/[0.09]" />
        <span className="absolute -right-[9rem] -top-[11rem] h-[38rem] w-[38rem] rounded-full border border-white/[0.06]" />
      </div>

      <div
        className={`relative mx-auto flex max-w-4xl flex-col items-center text-center ${
          size === 'compact' ? 'py-20 sm:py-24' : 'py-24 sm:py-32 lg:py-36'
        }`}
      >
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75"
        >
          {eyebrow}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease }}
          className={`mt-5 font-bold leading-[1.08] tracking-tight text-white text-balance select-text ${
            size === 'compact' ? 'text-3xl sm:text-[2.75rem]' : 'text-4xl sm:text-5xl lg:text-[3.75rem]'
          }`}
        >
          {title}
          {titleMuted && (
            <>
              <br />
              <span className="text-white/70">{titleMuted}</span>
            </>
          )}
        </motion.h1>

        {description && (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 text-balance"
          >
            {description}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease }}
            className="mt-9 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row"
          >
            {children}
          </motion.div>
        )}

        {meta && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-7 text-sm text-white/70"
          >
            {meta}
          </motion.div>
        )}
      </div>
    </section>
  );
}
