import { PointerEvent, useRef } from 'react';
import { useMotionValue, useScroll, useSpring, useTransform } from 'motion/react';

const POINTER_SPRING = { stiffness: 110, damping: 18, mass: 0.6 };

// Layers drift with the page scroll and lean toward the pointer, each at its own depth.
export function useParallaxStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stageRef, offset: ['start end', 'end start'] });

  const pointerX = useSpring(useMotionValue(0), POINTER_SPRING);
  const pointerY = useSpring(useMotionValue(0), POINTER_SPRING);

  const backScroll = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const frontScroll = useTransform(scrollYProgress, [0, 1], [-18, 18]);

  const back = {
    x: useTransform(pointerX, (value) => value * -36),
    y: useTransform([backScroll, pointerY], ([scroll, pointer]: number[]) => scroll + pointer * -36),
  };
  const front = {
    x: useTransform(pointerX, (value) => value * 22),
    y: useTransform([frontScroll, pointerY], ([scroll, pointer]: number[]) => scroll + pointer * 22),
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };
  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return { stageRef, back, front, onPointerMove, onPointerLeave };
}
