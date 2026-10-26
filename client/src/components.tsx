import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import { motion } from "motion/react";
import { Illustration, Reveal, Skeleton } from "./Visual";
import { ArrowUpRight, HeartPulse, MapPin, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
export function Logo() {
  return (
    <Link to="/" className="brand" aria-label="Atharv Enterprises home">
      <img
        src="/images/brand/logo-transparent.png"
        alt=""
        width={68}
        height={68}
      />
      <span>
        ATHARV <b>ENTERPRISES</b>
        <small>NURSING & HOME CARE</small>
      </span>
    </Link>
  );
}
export function Header() {
  return <Navigation />;
}
export function Footer() {
  const { data: s } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/public/settings"),
  });
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.05 }}
      transition={{ duration: 0.6 }}
    >
      <div className="footer-top">
        <div className="footer-motif" aria-hidden="true">
          <Illustration name="journey" />
        </div>
        <div>
          <p className="eyebrow light">LET’S FIND YOUR WAY FORWARD</p>
          <h2>
            A little support.
            <br />A world of difference.
          </h2>
        </div>
        <Link className="button pale" to="/request-care">
          Let’s talk about care <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="footer-grid">
        <div>
          <Logo />
          <p>
            Compassionate care. Familiar surroundings.
            <br />A care journey coordinated around you.
          </p>
          <span className="location">
            <MapPin size={15} /> Pune, Maharashtra, India
          </span>
        </div>
        <div>
          <h3>Explore</h3>
          {[
            ["Home nursing", "/services/home-nursing"],
            ["Elderly care", "/services/elderly-care"],
            ["About us", "/about"],
            ["Our services", "/services"],
            ["How it works", "/how-it-works"],
            ["Join our team", "/careers"],
          ].map(([t, p]) => (
            <Link key={p} to={p}>
              {t}
            </Link>
          ))}
        </div>
        <div>
          <h3>Here to help</h3>
          {[
            ["Contact us", "/contact"],
            ["Common questions", "/faq"],
            ["Caregiver standards", "/caregiver-standards"],
            ["Feedback & complaints", "/complaints"],
          ].map(([t, p]) => (
            <Link key={p} to={p}>
              {t}
            </Link>
          ))}
          {s?.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
          {s?.phone && <a href={`tel:${s.phone}`}>{s.phone}</a>}
        </div>
        <div>
          <h3>Your peace of mind</h3>
          {[
            ["Privacy policy", "/privacy-policy"],
            ["Terms of use", "/terms"],
            ["Booking terms", "/booking-terms"],
            ["Cancellation policy", "/cancellation-policy"],
            ["Accessibility", "/accessibility"],
          ].map(([t, p]) => (
            <Link key={p} to={p}>
              {t}
            </Link>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} Atharv Enterprises. All rights reserved.
        </span>
        <span>
          Made for care. Built around people. <HeartPulse size={15} />
        </span>
      </div>
      <p className="emergency">
        Not an emergency service. For urgent medical help, contact local
        emergency services or the nearest emergency department.
      </p>
    </motion.footer>
  );
}
export function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="page-intro container">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {children && <p className="intro-copy">{children}</p>}
    </section>
  );
}
export function CTA() {
  return (
    <Reveal className="final-care-cta container">
      <div className="cta-art">
        <Illustration
          name="care-conversation"
          alt="Illustration of a family discussing home care"
        />
      </div>
      <div>
        <p className="eyebrow">YOU DON’T HAVE TO FIGURE IT OUT ALONE</p>
        <h2>
          A little care.
          <br />
          <em>A world of difference.</em>
        </h2>
        <p>
          Tell us what your family needs.
          <br />
          Let’s find your way forward, together.
        </p>
        <Link className="button" to="/request-care">
          Request care <ArrowUpRight size={18} />
        </Link>
        <Link className="cta-secondary" to="/contact">
          Or start with a conversation <ArrowRight size={15} />
        </Link>
      </div>
      <span className="cta-decor" aria-hidden="true">
        +
      </span>
    </Reveal>
  );
}
export function Status({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="status"
      data-status={typeof children === "string" ? children : undefined}
    >
      {children}
    </span>
  );
}
export function ErrorState({
  error,
  retry,
}: {
  error: Error;
  retry?: () => void;
}) {
  return (
    <div className="notice error" role="alert">
      <b>We couldn’t load this information.</b>
      <p>{error.message}</p>
      {retry && (
        <button className="button secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function Loading() {
  return <Skeleton />;
}
