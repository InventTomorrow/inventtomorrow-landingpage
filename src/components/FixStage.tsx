import { motion, useReducedMotion } from 'motion/react';
import type { Fix } from '../content/fixes';
import { useParallaxStage } from '../hooks/useParallaxStage';
import { FixScenePreview } from './FixScenePreview';

// The example conversation for one automation, on a soft gradient stage whose shapes drift with the page and pointer.
export function FixStage({ fix }: { fix: Fix }) {
  const reduceMotion = useReducedMotion();
  const parallax = useParallaxStage();

  return (
    <div
      ref={parallax.stageRef}
      onPointerMove={reduceMotion ? undefined : parallax.onPointerMove}
      onPointerLeave={reduceMotion ? undefined : parallax.onPointerLeave}
      className="relative flex min-h-0 flex-1 items-center overflow-hidden rounded-[2rem] bg-[radial-gradient(120%_90%_at_50%_0%,var(--color-accent-soft)_0%,var(--color-mist)_45%,var(--color-stone)_100%)] px-4 py-5 sm:px-10"
    >
      <motion.div style={reduceMotion ? undefined : parallax.back} className="pointer-events-none absolute inset-0" aria-hidden="true">
        <span className="absolute -right-16 -top-12 h-64 w-64 rounded-drop bg-primary/10" />
        <span className="absolute -left-10 bottom-4 h-44 w-44 rounded-drop border border-primary/20" />
        <span className="absolute bottom-16 right-10 h-14 w-14 rounded-drop bg-sky/50" />
        <span className="absolute left-12 top-14 h-5 w-5 rounded-drop bg-primary/40" />
      </motion.div>

      <motion.div style={reduceMotion ? undefined : parallax.front} className="relative w-full">
        <FixScenePreview fix={fix} />
      </motion.div>
    </div>
  );
}
