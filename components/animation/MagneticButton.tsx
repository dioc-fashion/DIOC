'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ComponentProps, ReactNode } from 'react';

type Props = Omit<ComponentProps<typeof motion.button>, 'children'> & {
  children: ReactNode;
};

export function MagneticButton({ children, ...props }: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      whileHover={reducedMotion ? undefined : { y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
