import type { Variants } from "motion/react";

export const careEase = [0.22, 1, 0.36, 1] as const;
export const careViewport = { once: true, amount: 0.12 } as const;

// Keep the server/initial render readable. Viewport keyframes add movement only
// once the observer sees content, without leaving it hidden if motion is unavailable.
export const sectionReveal: Variants = {
  visible: (delay: number = 0) => ({
    opacity: delay < 0 ? 1 : [0.35, 1],
    y: delay < 0 ? 0 : [24, 0],
    transition: {
      duration: delay < 0 ? 0 : 0.65,
      delay: Math.max(0, delay),
      ease: careEase,
    },
  }),
};
export const cardReveal: Variants = {
  visible: (delay: number = 0) => ({
    opacity: delay < 0 ? 1 : [0.3, 1],
    y: delay < 0 ? 0 : [28, 0],
    scale: delay < 0 ? 1 : [0.975, 1],
    transition: {
      duration: delay < 0 ? 0 : 0.65,
      delay: Math.max(0, delay),
      ease: careEase,
    },
  }),
};
export const illustrationReveal: Variants = {
  visible: (delay: number = 0) => ({
    y: delay < 0 ? 0 : [6, -2, 0],
    scale: delay < 0 ? 1 : [0.98, 1],
    transition: {
      duration: delay < 0 ? 0 : 1.1,
      delay: Math.max(0, delay),
      ease: careEase,
    },
  }),
};
