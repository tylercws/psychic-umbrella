import type { Variants } from "motion/react";
import { motionTokens } from "../../motionTokens";

export const trackDetailMotion: Record<string, Variants> = {
  header: motionTokens.bento,
  panel: motionTokens.bento,
  glass: motionTokens.glass,
  float: motionTokens.float,
  page: motionTokens.page,
  item: {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  },
};
