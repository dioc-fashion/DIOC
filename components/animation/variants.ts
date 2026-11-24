import type { Variants } from 'motion/react';

export const timing = {
  quick: 0.18,
  standard: 0.32,
  reveal: 0.65,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: timing.reveal, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerChildren: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: timing.standard, ease: [0.22, 1, 0.36, 1] },
  },
};
