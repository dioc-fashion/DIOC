'use client';

import { motion, useReducedMotion, useScroll } from 'motion/react';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="scroll-progress"
      style={{ scaleX: reducedMotion ? 0 : scrollYProgress }}
      aria-hidden="true"
    />
  );
}
