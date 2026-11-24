'use client';

import Image from 'next/image';
import { motion, useReducedMotion } from 'motion/react';

export function ImageReveal({
  src,
  alt,
  className,
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : { opacity: 0.6, scale: 1.025 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <Image src={src} alt={alt} fill priority={priority} sizes={sizes} />
    </motion.div>
  );
}
