'use client';

import { motion, useMotionValueEvent, useScroll } from 'motion/react';
import type { ComponentProps, ReactNode } from 'react';
import { useState } from 'react';

type Props = Omit<ComponentProps<typeof motion.header>, 'children'> & {
  children: ReactNode;
};

export function AnimatedHeader({ children, ...props }: Props) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, 'change', (value) => {
    const next = value > 12;
    setScrolled((current) => (current === next ? current : next));
  });

  return (
    <motion.header
      {...props}
      data-scrolled={scrolled}
      initial={false}
      animate={{ boxShadow: scrolled ? '0 4px 18px rgba(23, 23, 21, 0.06)' : '0 0 0 rgba(23, 23, 21, 0)' }}
      transition={{ duration: 0.22 }}
    >
      {children}
    </motion.header>
  );
}
