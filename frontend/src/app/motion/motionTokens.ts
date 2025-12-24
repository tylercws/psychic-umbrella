import { Variants, Transition } from "motion/react";

export const springPresets: Record<
  "soft" | "liquid" | "snap",
  Transition
> = {
  soft: { type: "spring", damping: 26, stiffness: 160, mass: 0.8 },
  liquid: { type: "spring", damping: 18, stiffness: 120, mass: 0.9 },
  snap: { type: "spring", damping: 32, stiffness: 320, mass: 0.7 },
};

export const fadeSlideVariants: Record<string, Variants> = {
  fadeInUp: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ...springPresets.soft, stiffness: 140 },
    },
  },
  fadeInRight: {
    hidden: { opacity: 0, x: 24 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { ...springPresets.liquid },
    },
  },
  cardLift: {
    hidden: { opacity: 0, y: 16, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { ...springPresets.liquid },
    },
    hover: {
      scale: 1.02,
      translateY: -2,
      transition: { ...springPresets.soft, stiffness: 200 },
    },
    tap: {
      scale: 0.98,
      transition: { ...springPresets.snap },
    },
  },
};

export const parallaxDepth: Record<
  "near" | "mid" | "deep" | "far",
  number
> = {
  near: 0.2,
  mid: 0.35,
  deep: 0.55,
  far: 0.75,
};
