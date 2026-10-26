import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  MapPin,
  ArrowUpRight,
  Menu,
  X,
  ChevronDown,
  HeartPulse,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { Logo } from "./components";
import { services } from "../../shared/catalog";
export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const ref = useRef<HTMLElement>(null);
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/public/settings"),
  });
  useEffect(() => {
    setOpen(false);
    setDropdown(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  useEffect(() => {
    const scroll = () => setScrolled(window.scrollY > 15);
    scroll();
    window.addEventListener("scroll", scroll, { passive: true });
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDropdown(false);
        setOpen(false);
      }
    };
    const outside = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  return (
    <>
      <motion.div
        className="announcement new-announcement"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div>
          <span>
            <MapPin size={13} /> Thoughtful care, closer to home.
            <b>{settings?.location || "Pune, Maharashtra"}</b>
          </span>
          <Link to="/contact">
            Let’s find your next step <ArrowUpRight size={13} />
          </Link>
        </div>
      </motion.div>
      <header
        ref={ref}
        className={`site-navigation ${scrolled ? "is-scrolled" : ""}`}
      >
        <div className="nav-wrap">
          <Logo />
          <nav
            id="main-navigation"
            aria-label="Main navigation"
            className={open ? "open" : ""}
          >
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About us</NavLink>
            <div className="nav-services">
              <div>
                <NavLink to="/services">Our services</NavLink>
                <button
                  aria-label="Toggle services menu"
                  aria-expanded={dropdown}
                  aria-controls="service-dropdown"
                  onClick={() => setDropdown(!dropdown)}
                >
                  <ChevronDown
                    size={13}
                    className={dropdown ? "rotated" : ""}
                  />
                </button>
              </div>
              <AnimatePresence>
                {dropdown && (
                  <motion.div
                    className="service-dropdown"
                    id="service-dropdown"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.18 }}
                  >
                    <div className="dropdown-heading">
                      <span>THE RIGHT SUPPORT, AT THE RIGHT TIME</span>
                      <ShieldCheck size={18} />
                    </div>
                    <div className="dropdown-services">
                      {services.map((s) => (
                        <Link key={s.slug} to={`/services/${s.slug}`}>
                          <span>
                            <HeartPulse size={18} />
                          </span>
                          <div>
                            <b>{s.name}</b>
                            <small>{s.tag.toLowerCase()}</small>
                          </div>
                          <ArrowUpRight size={14} />
                        </Link>
                      ))}
                    </div>
                    <Link className="dropdown-bottom" to="/services">
                      Explore all care services <ArrowRight size={15} />
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <NavLink to="/how-it-works">How it works</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <NavLink to="/portal" className="mobile-only">
              My care portal
            </NavLink>
          </nav>
          <div className="nav-actions">
            <Link className="portal-link" to="/portal">
              My portal <ArrowUpRight size={13} />
            </Link>
            <Link className="button small" to="/request-care">
              Request care <ArrowUpRight size={16} />
            </Link>
            <button
              className="menu-button icon-button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="main-navigation"
              onClick={() => {
                setOpen(!open);
                setDropdown(false);
              }}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
