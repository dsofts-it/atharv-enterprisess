import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const reduced = useReducedMotion();
  const progress = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.3,
  });
  return (
    <motion.div
      className="reading-progress"
      aria-hidden="true"
      data-scroll-progress
      style={{ scaleX: reduced ? scrollYProgress : progress }}
    />
  );
}
