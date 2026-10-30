import { PointerEvent } from 'react';
import { useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react';

const SPRING = { stiffness: 220, damping: 22, mass: 0.5 };

// Leans an element toward the pointer, up to `maxTilt` degrees.
export function useTilt(maxTilt: number) {
  const reduceMotion = useReducedMotion();
  const pointerX = useSpring(useMotionValue(0), SPRING);
  const pointerY = useSpring(useMotionValue(0), SPRING);
  const rotateY = useTransform(pointerX, (value) => value * maxTilt * 2);
  const rotateX = useTransform(pointerY, (value) => value * -maxTilt * 2);

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType === 'touch') return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };
  const onPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return { rotateX, rotateY, onPointerMove, onPointerLeave };
}
