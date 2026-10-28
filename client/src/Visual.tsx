import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { careViewport, sectionReveal } from "./careMotion";
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
  return (
    <motion.div
      data-care-reveal
      data-scroll-motion
      className={className}
      initial={false}
      whileInView="visible"
      viewport={careViewport}
      variants={sectionReveal}
      custom={reduced ? -1 : delay}
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
  const y = useTransform(scrollYProgress, [0, 1], [8, -8]);
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
      style={{ y: reduced ? 0 : y }}
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
