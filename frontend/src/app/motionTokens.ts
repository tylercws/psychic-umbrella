import { Variants } from "motion/react";

export const motionTokens: Record<string, Variants> = {
  page: {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.12,
        type: "spring",
        stiffness: 140,
        damping: 18,
      },
    },
  },
  bento: {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 160,
        damping: 20,
      },
    },
  },
  glass: {
    hidden: { opacity: 0, scale: 0.96 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 180,
        damping: 16,
      },
    },
  },
  chip: {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 200, damping: 18 },
    },
  },
  float: {
    rest: { y: 0, opacity: 0.9 },
    hover: {
      y: -6,
      opacity: 1,
      transition: { type: "spring", stiffness: 320, damping: 18 },
    },
  },
};

export const springy = {
  type: "spring" as const,
  stiffness: 260,
  damping: 24,
};
