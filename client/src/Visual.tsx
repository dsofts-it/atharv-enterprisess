import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduced = useReducedMotion();
  const target = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const travel = useTransform(scrollYProgress, [0, 0.5, 1], [24, 0, -24]);
  const y = useSpring(travel, { stiffness: 140, damping: 30, mass: 0.25 });
  const variant = /art|visual|gallery/.test(className)
    ? "scale"
    : /heading|copy/.test(className)
      ? "left"
      : "rise";
  return (
    <motion.div
      ref={target}
      data-care-reveal
      data-scroll-motion
      data-motion-variant={variant}
      className={className}
      style={{ y: reduced ? 0 : y }}
      initial={
        reduced
          ? false
          : {
              opacity: 0,
              x: variant === "left" ? -16 : 0,
              scale: variant === "scale" ? 0.97 : 1,
            }
      }
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.1, margin: "0px 0px -10px 0px" }}
      onViewportEnter={(entry) => {
        if (entry) {
          const element = entry.target as HTMLElement;
          element.dataset.revealState = "visible";
          element.dataset.revealCount = String(
            Number(element.dataset.revealCount || 0) + 1,
          );
        }
      }}
      onViewportLeave={(entry) => {
        if (entry)
          (entry.target as HTMLElement).dataset.revealState = "outside";
      }}
      transition={{
        duration: 0.65,
        delay: Math.min(delay, 0.18),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
export function Illustration({
  name,
  alt = "",
  className = "",
}: {
  name: string;
  alt?: string;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const target = useRef<HTMLImageElement>(null);
  const { scrollYProgress } = useScroll({
    target,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [18, -18]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-1.5, 1.5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.98, 1.02, 1]);
  const editorial = new Set([
    "home-nursing",
    "elderly-care",
    "patient-attendant",
    "post-operative-care",
    "24-hour-care",
    "bedridden-care",
    "family-home",
    "personal-plan",
    "quote-review",
    "team-handover",
    "connected-care",
    "credential-review",
    "family-feedback",
    "portal-connected",
    "care-questions",
    "care-conversation",
    "care-heart",
    "care-continuity",
  ]);
  return (
    <motion.img
      ref={target}
      data-scroll-art
      style={reduced ? { y: 0, rotate: 0, scale: 1 } : { y, rotate, scale }}
      className={`care-illustration ${className}`}
      src={`/images/${editorial.has(name) ? "editorial" : "illustrations"}/${name}.svg`}
      alt={alt}
      loading="lazy"
      width={editorial.has(name) ? 520 : 400}
      height={editorial.has(name) ? 360 : 280}
    />
  );
}
export function EmptyState({
  type = "empty-booking",
  title = "A fresh start for your care.",
  text,
  action,
  to,
  onAction,
}: {
  type?: string;
  title?: string;
  text: string;
  action?: string;
  to?: string;
  onAction?: () => void;
}) {
  return (
    <Reveal className="illustrated-empty">
      <Illustration name={type} />
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
        {action &&
          (to ? (
            <Link className="text-link" to={to}>
              {action}
              <ArrowUpRight size={16} />
            </Link>
          ) : (
            <button className="text-button" onClick={onAction}>
              {action}
              <ArrowUpRight size={16} />
            </button>
          ))}
      </div>
    </Reveal>
  );
}
export function Skeleton() {
  return (
    <div
      className="care-skeleton"
      role="status"
      aria-label="Loading your care information"
    >
      <span />
      <div>
        <i />
        <i />
        <i />
      </div>
      <span />
    </div>
  );
}
export const journey = [
  ["Your needs", "Tell us about the care you’re looking for.", "personal-plan"],
  [
    "A considered plan",
    "Discuss suitability, availability and your quote.",
    "team-handover",
  ],
  [
    "Clear agreements",
    "Review your care scope and responsibilities.",
    "quote-review",
  ],
  [
    "Care, coordinated",
    "An eligible caregiver is assigned after confirmation.",
    "connected-care",
  ],
  [
    "Stay connected",
    "Manage schedules, requests and updates together.",
    "care-continuity",
  ],
] as const;
