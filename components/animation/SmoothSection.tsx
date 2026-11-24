'use client';

import { motion, useReducedMotion } from 'motion/react';
import type { ComponentProps, ReactNode } from 'react';

type Props = Omit<ComponentProps<typeof motion.section>, 'children'> & {
  children: ReactNode;
};

export function SmoothSection({ children, ...props }: Props) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={{ duration: reducedMotion ? 0 : 0.5, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.section>
  );
}
