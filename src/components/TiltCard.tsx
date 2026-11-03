import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { useTilt } from '../hooks/useTilt';

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  delay?: number;
}

// A card that fades up, then leans toward the pointer and lifts on hover.
export function TiltCard({ children, className = '', maxTilt = 5, delay = 0 }: TiltCardProps) {
  const { rotateX, rotateY, onPointerMove, onPointerLeave } = useTilt(maxTilt);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
}
