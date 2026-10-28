import { useId, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  HeartPulse,
  ShieldCheck,
  Users,
  Sun,
  HandHeart,
  Activity,
  Moon,
  BedDouble,
  Check,
  MapPin,
  Plus,
  Search,
  Quote,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  LockKeyhole,
  Sparkles,
} from "lucide-react";
import { services, faqs, areas } from "../../shared/catalog";
import { api } from "./api";
import { CTA, ErrorState } from "./components";
import { Reveal, Illustration, journey } from "./Visual";
import {
  careViewport,
  cardReveal,
  illustrationReveal,
  sectionReveal,
} from "./careMotion";
export const icons = [HeartPulse, Sun, HandHeart, Activity, Moon, BedDouble];
const extraQuestions = [
  [
    "How is my caregiver assigned?",
    "After assessment, quote and agreement, the team checks service eligibility, current credentials where required, locality and schedule before coordinating an assignment.",
  ],
  [
    "Can I extend my care arrangement?",
    "Open an Extension request in your portal. The team reviews availability, a revised quote and any agreement updates before confirming.",
  ],
  [
    "What if I need to cancel?",
    "Send a Cancellation request from Support in your portal. The team reviews your accepted terms and any safe handover needs. The request itself does not automatically cancel active care.",
  ],
  [
    "Why do I need a care agreement?",
    "Your agreement explains the scope of support, billing and responsibilities. Read it before accepting; you can retain a downloadable copy in your portal.",
  ],
  [
    "How do I contact the care team?",
    "Use the Contact page for general questions, or Support in your portal for a private request linked to your care. Do not wait for a website reply in an emergency.",
  ],
];
export function ServiceCards({ limit = 6 }: { limit?: number }) {
  const reduced = useReducedMotion();
  const { data: catalog = services, error } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<typeof services>("/services"),
    placeholderData: services,
  });
  if (error) return <ErrorState error={error} />;
  return (
    <div className="service-gallery premium-services">
      {catalog.slice(0, limit).map((s, i) => {
        const Icon = icons[i % icons.length];
        return (
          <motion.div
            key={s.slug}
            data-scroll-motion
            initial={false}
            whileInView="visible"
            viewport={careViewport}
            variants={cardReveal}
            custom={reduced ? -1 : (i % 3) * 0.1}
          >
            <article className={`visual-service visual-service-${i}`}>
              <Link
                className="service-art"
                to={`/services/${s.slug}`}
                aria-label={`Explore ${s.name}`}
              >
                <motion.div
                  className="service-illustration"
                  variants={illustrationReveal}
                  custom={reduced ? -1 : (i % 3) * 0.1}
                >
                  <img
                    className="care-illustration"
                    src={`/images/editorial/${s.slug}.svg`}
                    alt={`Illustration of ${s.name.toLowerCase()}, fictional people`}
                    width={520}
                    height={360}
                    loading="lazy"
                    decoding="async"
                  />
                </motion.div>
                <span className="service-art-icon" aria-hidden="true">
                  <Icon size={20} />
                </span>
              </Link>
              <div className="service-body">
                <small>{s.tag}</small>
                <h3>
                  <Link to={`/services/${s.slug}`}>{s.name}</Link>
                </h3>
                <p>{s.summary}</p>
                <div className="service-links">
                  <Link
                    to={`/services/${s.slug}`}
                    aria-label={`Learn more about ${s.name.toLowerCase()}`}
                  >
                    Learn more{" "}
                    <span className="service-arrow" aria-hidden="true">
                      <ArrowUpRight size={17} />
                    </span>
                  </Link>
                  <Link
                    to={`/request-care?service=${s.slug}`}
                    aria-label={`Request ${s.name.toLowerCase()}`}
                    className="service-book"
                  >
                    <Plus size={18} />
                  </Link>
                </div>
              </div>
            </article>
          </motion.div>
        );
      })}
    </div>
  );
}
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`faq-item ${open ? "is-open" : ""}`}>
      <h3>
        <button
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          {q}
          <Plus size={19} />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            role="region"
            aria-label={q}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export function FAQs({ limit = 11 }: { limit?: number }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All questions");
  const questions = [...faqs, ...extraQuestions]
    .filter(([q, a]) =>
      `${q} ${a}`.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(
      ([q]) =>
        category === "All questions" ||
        (category === "Getting started"
          ? /arrange|difference|contact|emergency/.test(q)
          : category === "Care arrangements"
            ? /caregiver|extend|cancel|night/.test(q)
            : /cost|agreement|pricing/.test(q)),
    );
  return (
    <div className="faq-browser">
      <label className="faq-search">
        <Search size={18} />
        <input
          aria-label="Search care questions"
          placeholder="What would you like to know?"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <div className="faq-categories" aria-label="Question categories">
        {[
          "All questions",
          "Getting started",
          "Care arrangements",
          "Quotes & agreements",
        ].map((c) => (
          <button
            key={c}
            className={category === c ? "active" : ""}
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="faqs">
        {questions.slice(0, search ? 30 : limit).map(([q, a]) => (
          <FAQItem key={q} q={q} a={a} />
        ))}
        {!questions.length && (
          <p className="notice">
            No matching questions. Try a different phrase or{" "}
            <Link to="/contact">contact the care team</Link>.
          </p>
        )}
      </div>
    </div>
  );
}
type Review = { name: string; text: string; context: string };
export function Testimonials({ items = [] }: { items?: Review[] }) {
  const [index, setIndex] = useState(0);
  return (
    <Reveal className="feedback-card">
      {!items.length ? (
        <>
          <div className="feedback-symbol">
            <Quote size={30} />
          </div>
          <div>
            <p className="eyebrow">BECAUSE YOUR EXPERIENCE MATTERS</p>
            <h2>
              Good care starts with listening.
              <br />
              <em>And keeps listening.</em>
            </h2>
            <p>
              Questions, a change in your needs, or something we could do
              better?
              <br />
              There’s always room for a conversation.
            </p>
            <Link className="text-link" to="/complaints">
              Share your experience <ArrowUpRight size={17} />
            </Link>
          </div>
          <Illustration name="family-feedback" />
        </>
      ) : (
        <>
          <Quote />
          <AnimatePresence mode="wait">
            <motion.blockquote
              key={index}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
            >
              <p>{items[index].text}</p>
              <cite>
                {items[index].name} · {items[index].context}
              </cite>
            </motion.blockquote>
          </AnimatePresence>
          <div>
            <button
              className="icon-button"
              aria-label="Previous testimonial"
              onClick={() =>
                setIndex((index - 1 + items.length) % items.length)
              }
            >
              <ChevronLeft />
            </button>
            <button
              className="icon-button"
              aria-label="Next testimonial"
              onClick={() => setIndex((index + 1) % items.length)}
            >
              <ChevronRight />
            </button>
          </div>
        </>
      )}
    </Reveal>
  );
}
export default function Home() {
  const reduced = useReducedMotion();
  const heroTarget = useRef<HTMLElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroTarget,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroProgress, [0, 1], [0, 42]);
  return (
    <div className="redesigned-home">
      <section className="home-hero" ref={heroTarget}>
        <div className="hero-grid container">
          <div className="hero-copy">
            <motion.p
              className="eyebrow hero-eyebrow"
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="pulse-dot" /> NURSING & HOME CARE IN PUNE
            </motion.p>
            <h1>
              {["Care that feels", "like home."].map((line, i) => (
                <span className="headline-mask" key={line}>
                  <motion.span
                    initial={reduced ? false : { y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      delay: i * 0.12,
                      duration: 0.8,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {i === 1 ? (
                      <em>
                        {line}
                        <svg viewBox="0 0 340 18" aria-hidden="true">
                          <path d="M5 12Q150-4 333 10" />
                        </svg>
                      </em>
                    ) : (
                      line
                    )}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
            >
              <p className="hero-description">
                Nursing care, elderly support, and recovery assistance in the
                comfort of your home. Personal support for your loved ones, with
                clear communication at every step.
              </p>
              <div className="hero-buttons">
                <Link to="/request-care" className="button">
                  Find the right care <ArrowUpRight size={18} />
                </Link>
                <Link to="/services" className="button secondary">
                  Explore our services <ArrowRight size={18} />
                </Link>
              </div>
              <div className="hero-assurance">
                <span className="round-symbol">
                  <ShieldCheck size={21} />
                </span>
                <div>
                  <b>Personal care. A shared plan.</b>
                  <span>
                    Clear scope. Coordinated support. Your peace of mind.
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
          <motion.div
            className="hero-visual hero-composition"
            style={{ y: reduced ? 0 : heroY }}
            initial={
              reduced
                ? false
                : { opacity: 0, clipPath: "inset(10% 5% 10% 5% round 45%)" }
            }
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 0%)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hero-blob" />
            <div className="hero-photo">
              <img
                src="/images/hero/home-care.webp"
                alt="AI-created illustrative scene of an Indian caregiver and elderly woman at home, not actual employees or clients"
                fetchPriority="high"
              />
              <span className="photo-editorial-label">
                FAMILIAR PLACES. MORE COMFORTABLE DAYS.
              </span>
            </div>
            <div className="hero-spark" aria-hidden="true">
              <Sparkles size={39} strokeWidth={1.2} />
            </div>
            <motion.div
              className="floating-note care-note"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <span className="note-icon">
                <HeartPulse size={23} />
              </span>
              <div>
                <b>Care built around you</b>
                <small>Your family. Your routines. Your needs.</small>
              </div>
              <Check size={17} />
            </motion.div>
            <div className="floating-note schedule-note">
              <span className="note-icon pink">
                <CalendarDays size={19} />
              </span>
              <div>
                <b>A little more peace of mind.</b>
                <small>One connected care journey.</small>
              </div>
            </div>
            <div className="hero-mini-art">
              <Illustration name="care-heart" />
            </div>
            <div className="image-disclosure">Illustrative care scene</div>
          </motion.div>
        </div>
        <div className="hero-bottom container">
          <span>
            <MapPin size={15} /> Local to Pune. Close to your family.
          </span>
          <Link to="/how-it-works">
            Discover a more thoughtful way to care <ArrowRight size={15} />
          </Link>
        </div>
      </section>
      <section
        className="trust-ribbon container"
        aria-label="Our approach to care"
      >
        {[
          [Users, "Coordinated care"],
          [ShieldCheck, "Screening before assignment"],
          [Heart, "Personalized support"],
          [HandHeart, "Family communication"],
          [FileIcon, "Clear arrangements"],
        ].map(([Icon, label]) => {
          const I = Icon as typeof Users;
          return (
            <div key={String(label)}>
              <I size={23} strokeWidth={1.5} />
              <span>{String(label)}</span>
            </div>
          );
        })}
      </section>
      <section className="section container" id="services">
        <Reveal className="section-heading">
          <motion.div variants={sectionReveal} custom={reduced ? -1 : 0}>
            <p className="eyebrow">CARE FOR EVERY CHAPTER</p>
            <h2>
              Different needs.
              <br />
              <em>The same human touch.</em>
            </h2>
          </motion.div>
          <motion.div variants={sectionReveal} custom={reduced ? -1 : 0.12}>
            <p>
              From a helping hand with everyday life to qualified nursing
              support. Find a place to begin, and we’ll work out the details
              together.
            </p>
            <Link className="text-link" to="/services">
              Discover our services <ArrowUpRight size={17} />
            </Link>
          </motion.div>
        </Reveal>
        <ServiceCards />
        <Reveal className="service-footnote">
          <HeartPulse size={17} />
          <p>
            Qualified nursing and non-clinical assistance have different scopes.
            We help you find the appropriate support.
          </p>
        </Reveal>
      </section>
      <section className="care-philosophy">
        <div className="container philosophy-grid">
          <Reveal className="philosophy-art">
            <div className="art-label">
              <span className="pulse-dot" /> PEOPLE FIRST. ALWAYS.
            </div>
            <Illustration
              name="family-home"
              alt="Original illustration of a family and care professional discussing support"
            />
            <div className="philosophy-note">
              <Heart size={20} />
              <p>
                It’s their home.
                <br />
                <b>Care should feel that way.</b>
              </p>
            </div>
          </Reveal>
          <Reveal className="philosophy-copy" delay={0.1}>
            <p className="eyebrow">MORE THAN CARE. A CONNECTION.</p>
            <h2>
              For the people
              <br />
              you call <em>your world.</em>
            </h2>
            <p>
              Choosing care for someone you love can feel like a big step. We
              start with a simple one: listening. To their needs, their familiar
              routines, and what matters to your family.
            </p>
            <div className="benefit-list">
              {[
                [
                  "A plan, never a one-size-fits-all approach",
                  "Needs, preferences and suitability guide every conversation.",
                ],
                [
                  "One team to bring the details together",
                  "From quotes and agreements to schedules and care changes.",
                ],
                [
                  "You stay part of the conversation",
                  "Follow your request and contact the team through your portal.",
                ],
              ].map(([t, d]) => (
                <div key={t}>
                  <span>
                    <Check size={16} />
                  </span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link className="text-link" to="/about">
              Get to know Atharv <ArrowUpRight size={17} />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="section container journey-section" id="care-journey">
        <Reveal className="center-heading">
          <p className="eyebrow">A CLEAR PATH. A CARING TEAM.</p>
          <h2>
            Your first question.
            <br />
            <em>The beginning of better support.</em>
          </h2>
          <p>We help you take it one considered step at a time.</p>
        </Reveal>
        <div className="illustrated-journey">
          {journey.map(([t, d, art], i) => (
            <Reveal key={t} delay={i * 0.06}>
              <div className="journey-art">
                <Illustration name={art} />
                <span>0{i + 1}</span>
              </div>
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
        <div className="center">
          <Link className="button secondary" to="/how-it-works">
            Walk through the care process <ArrowRight size={17} />
          </Link>
        </div>
      </section>
      <section className="screening-section container">
        <Reveal className="screening-copy">
          <p className="eyebrow">
            THOUGHTFUL MATCHING. CLEAR RESPONSIBILITIES.
          </p>
          <h2>
            The right people.
            <br />
            <em>The right kind of care.</em>
          </h2>
          <p>
            Caregiver approval is a process, not a promise on a profile. Before
            assignment, our workflow checks what matters for the requested
            service.
          </p>
          <div className="screening-checks">
            {[
              "Service and locality eligibility",
              "Qualifications for clinical tasks",
              "Current agreement and approval",
              "Schedule, working hours and rest",
            ].map((t, i) => (
              <div key={t}>
                <span>0{i + 1}</span>
                {t}
                <Check size={16} />
              </div>
            ))}
          </div>
          <Link className="text-link" to="/caregiver-standards">
            Understand our care standards <ArrowUpRight size={17} />
          </Link>
        </Reveal>
        <Reveal className="screening-art">
          <Illustration
            name="credential-review"
            alt="Illustration of a care professional profile and verification checklist"
          />
          <span className="screening-badge">
            <ShieldCheck size={19} /> A considered approach to care
          </span>
        </Reveal>
      </section>
      <section className="section container">
        <Testimonials />
      </section>
      <section className="portal-promo">
        <div className="container portal-promo-grid">
          <Reveal>
            <Illustration
              name="portal-connected"
              alt="Illustration of a caregiver and organized care schedule"
            />
          </Reveal>
          <Reveal>
            <p className="eyebrow">YOUR CARE, CONNECTED</p>
            <h2>
              A little less to manage.
              <br />
              <em>A little more clarity.</em>
            </h2>
            <p>
              Requests, agreements, schedules and care conversations. Your
              portal keeps the next step close at hand.
            </p>
            <div className="portal-promo-features">
              <span>
                <CalendarDays size={17} /> Care schedules
              </span>
              <span>
                <LockKeyhole size={17} /> Private updates
              </span>
              <span>
                <HandHeart size={17} /> Team support
              </span>
            </div>
            <Link className="button" to="/portal">
              Meet your care portal <ArrowUpRight size={17} />
            </Link>
          </Reveal>
        </div>
      </section>
      <section className="section container">
        <Reveal className="coverage coverage-redesign">
          <div>
            <p className="eyebrow">ROOTED IN PUNE. HERE FOR YOU.</p>
            <h2>
              Good care.
              <br />
              <em>A little closer to home.</em>
            </h2>
            <p>
              Tell us your locality. The team will confirm service availability
              and help you find a suitable starting point.
            </p>
            <Link className="text-link" to="/contact">
              Let’s check your area <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="area-list">
            <div className="area-map" aria-hidden="true">
              <span className="map-road r1" />
              <span className="map-road r2" />
              <span className="map-road r3" />
              <span className="map-pin">
                <MapPin size={23} />
              </span>
              <span className="map-label">PUNE</span>
            </div>
            <div>
              {areas.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>
            <small>
              Subject to individual assessment and staff availability.
            </small>
          </div>
        </Reveal>
      </section>
      <section className="container faq-grid redesigned-faq">
        <Reveal>
          <p className="eyebrow">LET’S MAKE THINGS CLEARER</p>
          <h2>
            A few questions.
            <br />
            <em>A little reassurance.</em>
          </h2>
          <p>
            Care decisions come with questions.
            <br />
            You don’t have to work them out alone.
          </p>
          <Illustration name="care-questions" />
          <Link className="text-link" to="/faq">
            Explore all questions <ArrowUpRight size={17} />
          </Link>
        </Reveal>
        <Reveal>
          <FAQs limit={5} />
        </Reveal>
      </section>
      <CTA />
    </div>
  );
}
function FileIcon(props: React.ComponentProps<typeof ShieldCheck>) {
  return <ShieldCheck {...props} />;
}
