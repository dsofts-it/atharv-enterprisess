import AuthExperience from "./AuthExperience";
import { Illustration, Reveal } from "./Visual";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  useEffect,
  useState,
  useId,
  Children,
  isValidElement,
  cloneElement,
} from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowUpRight,
  Check,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";
import { services, areas } from "../../shared/catalog";
import { inquirySchema, bookingSchema } from "../../shared/schemas";
import { api, post } from "./api";
import { PageIntro, CTA, ErrorState, Loading } from "./components";
import { ServiceCards, FAQs } from "./Home";
export function Services() {
  return (
    <>
      <PageIntro
        eyebrow="CARE, SHAPED AROUND YOU"
        title="The right support makes all the difference."
      >
        Explore nursing and everyday assistance. Every request begins with a
        conversation about your needs.
      </PageIntro>
      <section className="container section compact">
        <ServiceCards />
      </section>
      <CTA />
    </>
  );
}
export function ServiceDetail() {
  const { slug } = useParams();
  const {
    data: s,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["service", slug],
    queryFn: () => api<(typeof services)[number]>(`/services/${slug}`),
    placeholderData: services.find((s) => s.slug === slug),
  });
  if (isLoading) return <Loading />;
  if (error)
    return (
      <section className="container section">
        <ErrorState error={error} />
      </section>
    );
  if (!s) return <NotFound />;
  return (
    <>
      <PageIntro eyebrow={s.tag} title={s.name}>
        {s.description}
      </PageIntro>
      <section className="container detail-grid">
        <article className="paper">
          <Illustration
            name={s.slug}
            alt={`Illustration of ${s.name.toLowerCase()}`}
            className="service-detail-art"
          />
          <h2>Care with clear expectations.</h2>
          <h3>What we can coordinate</h3>
          <ul className="check-list">
            {s.includes.map((t) => (
              <li key={t}>
                <Check size={18} />
                {t}
              </li>
            ))}
          </ul>
          <h3>Outside this service’s scope</h3>
          <ul>
            {s.excludes.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
          <h3>Who provides the care?</h3>
          <p>
            {s.clinical
              ? "Appropriately qualified nurses, with current credentials checked before clinical assignment. Tasks must follow the treating clinician’s directions."
              : "Non-clinical attendants or caregivers matched to the requested support. Clinical procedures require a separately qualified professional."}
          </p>
          <h3>Flexible arrangements</h3>
          <p>
            Day, night, 12-hour and extended coverage may be requested. Extended
            care uses suitable multi-person coverage. Availability, rest periods
            and eligibility are reviewed before confirmation.
          </p>
          <p className="notice">
            This service supports care coordination and does not replace medical
            assessment or emergency treatment.
          </p>
        </article>
        <aside className="request-card">
          <ShieldCheck size={32} />
          <h2>A plan that starts with you.</h2>
          <p>
            Share your needs. We’ll review suitability, availability and a
            personalized quote.
          </p>
          <b>Request a quote</b>
          <p>No unconfirmed prices. No instant staff guarantees.</p>
          <Link className="button" to={`/request-care?service=${s.slug}`}>
            Request this care <ArrowUpRight size={18} />
          </Link>
        </aside>
      </section>
      <section className="container section">
        <h2>Good to know</h2>
        <FAQs limit={4} />
      </section>
      <CTA />
    </>
  );
}
export function About() {
  return (
    <>
      <PageIntro
        eyebrow="THE PEOPLE BEHIND THE SUPPORT"
        title="Care is personal. We keep it that way."
      >
        Atharv Enterprises coordinates nursing care and everyday patient
        assistance for families in Pune, Maharashtra.
      </PageIntro>
      <section className="container editorial">
        <Reveal className="about-team-visual">
          <Illustration
            name="team"
            alt="Original illustration of a diverse caregiving team, fictional people"
          />
          <div>
            <p className="eyebrow">PEOPLE, BEFORE EVERYTHING</p>
            <h2>
              Different roles.
              <br />
              <em>One shared purpose.</em>
            </h2>
            <p>
              Qualified nursing, practical assistance and thoughtful
              coordination each have a part to play. Every care journey begins
              with understanding the person.
            </p>
          </div>
        </Reveal>
        <h2>
          Familiar surroundings.
          <br />
          Thoughtful support.
        </h2>
        <p>
          Our purpose is to help families navigate care at home with clear
          communication, suitable staffing and respect for each person’s
          routines and dignity. Care is coordinated through the company so there
          is a shared process for requests, handovers and changes.
        </p>
        <div className="three-grid">
          {[
            [
              "Dignity first",
              "Care should respect preferences, privacy and independence.",
            ],
            [
              "Clear responsibilities",
              "Qualified nursing is distinct from non-clinical assistance. Care tasks must stay within the provider’s competence.",
            ],
            [
              "Accountability together",
              "Agreements, scheduling and support requests keep the care relationship traceable.",
            ],
          ].map(([t, d]) => (
            <div className="paper" key={t}>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
        <h2>A considered approach to matching.</h2>
        <p>
          Profiles record qualifications, service eligibility, locality and
          agreement status. Approval and current credentials are checked before
          assignment. We do not publish unverified licenses, awards or
          performance statistics.
        </p>
        <Link to="/caregiver-standards" className="text-link">
          Read the caregiver standards <ArrowUpRight size={16} />
        </Link>
      </section>
      <CTA />
    </>
  );
}
export function HowItWorks() {
  return (
    <>
      <PageIntro
        eyebrow="A CLEARER PATH TO CARE"
        title="One step at a time. Together."
      >
        Browse freely. Create an account when you’re ready to submit and
        securely manage a detailed care request.
      </PageIntro>
      <section className="container narrow">
        {[
          [
            "Tell us what you need",
            "Choose a service, preferred shift, start date and locality. Share only what is needed to start the conversation.",
          ],
          [
            "Review the options",
            "The team assesses requirements and prepares a quote. A request does not mean staff have been confirmed.",
          ],
          [
            "Read and accept your agreement",
            "Review the scope, billing arrangement, cancellation process and responsibilities before confirming.",
          ],
          [
            "Care is coordinated",
            "Eligible staff are matched to the booking, with credential, agreement, schedule and rest checks.",
          ],
          [
            "Keep in touch",
            "Your portal brings together approved care updates, schedules, invoices and requests for changes.",
          ],
        ].map(([t, d], i) => (
          <article className="process-row" key={t}>
            <span className="step-number">0{i + 1}</span>
            <div>
              <h2>{t}</h2>
              <p>{d}</p>
            </div>
          </article>
        ))}
      </section>
      <CTA />
    </>
  );
}
export function FAQPage() {
  return (
    <>
      <PageIntro
        eyebrow="HERE TO HELP"
        title="A little clarity goes a long way."
      />
      <section className="container narrow">
        <FAQs />
      </section>
      <CTA />
    </>
  );
}
export function Contact({ careers = false }: { careers?: boolean }) {
  const [sent, setSent] = useState(false);
  const { data: s } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/public/settings"),
  });
  const form = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { service: careers ? "Career inquiry" : "General inquiry" },
  });
  const submit = form.handleSubmit(async (d) => {
    try {
      await post("/public/inquiries", d);
      setSent(true);
    } catch (e) {
      toast.error((e as Error).message);
    }
  });
  return (
    <>
      <PageIntro
        eyebrow={
          careers ? "BUILD A CAREER WITH CARE" : "LET’S START A CONVERSATION"
        }
        title={
          careers
            ? "Bring your care to the team."
            : "We’re here to help you find your next step."
        }
      >
        {careers
          ? "Qualified nurses and non-clinical caregivers can express interest. The team reviews eligibility and credentials before onboarding."
          : "For care questions, availability or general information, leave a message for our team."}
      </PageIntro>
      <section className="container detail-grid">
        <div>
          <h2>
            {careers
              ? "A thoughtful place to start."
              : "Care starts with listening."}
          </h2>
          <p>
            Use this form for general inquiries. Please do not submit medical
            records, identity documents or confidential health details.
          </p>
          <Illustration
            name="contact"
            className="contact-coordinator-art"
            alt="Illustration of a friendly care coordinator"
          />
          <p className="contact-line">
            <MapPin /> Pune, Maharashtra, India
          </p>
          {s?.phone && (
            <p className="contact-line">
              <Phone />
              <a href={`tel:${s.phone}`}>{s.phone}</a>
            </p>
          )}
          {s?.email && (
            <p className="contact-line">
              <Mail />
              <a href={`mailto:${s.email}`}>{s.email}</a>
            </p>
          )}
          <div className="notice">
            This is not an emergency service. Seek urgent medical assistance
            directly for an emergency.
          </div>
        </div>
        <div className="paper">
          {sent ? (
            <div role="status">
              <Check size={38} />
              <h2>Thank you for reaching out.</h2>
              <p>Your inquiry has been saved for the team to review.</p>
              <button
                className="button secondary"
                onClick={() => {
                  form.reset();
                  setSent(false);
                }}
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2>
                {careers
                  ? "Express your interest"
                  : "Tell us a little about yourself"}
              </h2>
              <Field
                label="Your name"
                error={form.formState.errors.name?.message}
              >
                <input {...form.register("name")} autoComplete="name" />
              </Field>
              <Field
                label="Email address"
                error={form.formState.errors.email?.message}
              >
                <input
                  {...form.register("email")}
                  type="email"
                  autoComplete="email"
                />
              </Field>
              <Field
                label="Phone number"
                error={form.formState.errors.phone?.message}
              >
                <input
                  {...form.register("phone")}
                  type="tel"
                  autoComplete="tel"
                />
              </Field>
              <Field
                label="Pune locality"
                error={form.formState.errors.locality?.message}
              >
                <input
                  {...form.register("locality")}
                  autoComplete="address-level2"
                />
              </Field>
              <Field label={careers ? "Role of interest" : "Care of interest"}>
                <select {...form.register("service")}>
                  <option>
                    {careers ? "Career inquiry" : "General inquiry"}
                  </option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="checkbox">
                <input type="checkbox" {...form.register("consent")} />I agree
                to be contacted about this inquiry and have read the{" "}
                <Link to="/privacy-policy">privacy notice</Link>.
              </label>
              {form.formState.errors.consent && (
                <p className="field-error">Please confirm your consent.</p>
              )}
              <button
                className="button full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Sending…" : "Send inquiry"}
                <ArrowUpRight size={17} />
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const fieldId = useId();
  return (
    <div className="field">
      <label htmlFor={fieldId}>{label}</label>
      {Children.map(children, (child) =>
        isValidElement(child) &&
        ["input", "select", "textarea"].includes(String(child.type))
          ? cloneElement(child as React.ReactElement<any>, {
              id: fieldId,
              "aria-invalid": !!error,
              "aria-describedby": error ? fieldId + "-error" : undefined,
            })
          : child,
      )}
      {error && (
        <small id={fieldId + "-error"} className="field-error">
          {error}
        </small>
      )}
    </div>
  );
}
export function AuthPage() {
  return <AuthExperience />;
}
export function ResetPassword() {
  const [raw] = useState(() => window.location.hash.slice(1));
  const [done, setDone] = useState(false);
  useEffect(() => {
    history.replaceState(null, "", window.location.pathname);
  }, []);
  return (
    <section className="container narrow section paper">
      <h1>Choose a new password.</h1>
      {done ? (
        <Link to="/login" className="button">
          Return to sign in
        </Link>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await post("/auth/reset-password", {
                token: raw,
                password: new FormData(e.currentTarget).get("password"),
              });
              setDone(true);
            } catch (e) {
              toast.error((e as Error).message);
            }
          }}
        >
          <Field label="New password">
            <input
              name="password"
              type="password"
              required
              minLength={12}
              autoComplete="new-password"
            />
          </Field>
          <button className="button">Reset password</button>
        </form>
      )}
    </section>
  );
}
export function RequestCare() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => api("/auth/me"),
    retry: false,
  });
  const [step, setStep] = useState(1);
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(() => ({
    service:
      new URLSearchParams(location.search).get("service") ||
      sessionStorage.getItem("care-service") ||
      "elderly-care",
    shift: "Day",
    duration: 7,
    locality: sessionStorage.getItem("care-locality") || "",
    startDate: "",
    preferredName: "",
    instructions: "",
    consent: false,
  }));
  const update = (key: string, value: unknown) =>
    setData({ ...data, [key]: value });
  async function next() {
    setError("");
    if (step === 1) {
      if (!data.locality || !data.startDate) {
        setError("Choose a locality and start date.");
        return;
      }
      if (!user) {
        sessionStorage.setItem("care-service", data.service);
        sessionStorage.setItem("care-locality", data.locality);
        sessionStorage.setItem("care-return", "/request-care");
        navigate("/login");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!data.preferredName.trim()) {
        setError("Enter a preferred name.");
        return;
      }
      setStep(3);
    } else {
      const parsed = bookingSchema.safeParse(data);
      if (!parsed.success) {
        setError(parsed.error.issues.map((i) => i.message).join(". "));
        return;
      }
      setBusy(true);
      try {
        const b = await post("/portal/bookings", parsed.data);
        setReference(b.reference);
        sessionStorage.removeItem("care-service");
        sessionStorage.removeItem("care-locality");
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setBusy(false);
      }
    }
  }
  if (reference)
    return (
      <section className="container section narrow paper success">
        <Check size={48} />
        <h1>Your care conversation has begun.</h1>
        <p>
          Request reference <b>{reference}</b>
        </p>
        <p>
          The team will review your request. A caregiver and price are confirmed
          only after assessment, quote and agreement.
        </p>
        <Link className="button" to="/portal">
          Go to your care portal
        </Link>
      </section>
    );
  return (
    <>
      <PageIntro
        eyebrow="LET’S FIND THE RIGHT SUPPORT"
        title="Tell us what care looks like for you."
      >
        A few details help us understand where to start. No payment is taken
        with your request.
      </PageIntro>
      <section className="container booking-layout">
        <aside>
          <div className="booking-progress">
            {[
              "Your care needs",
              "A little more detail",
              "Review & request",
            ].map((t, i) => (
              <div key={t} className={step === i + 1 ? "current" : ""}>
                <span>{i + 1}</span>
                {t}
              </div>
            ))}
          </div>
          <p>
            <ShieldCheck size={20} /> Your detailed information is shared only
            through the authenticated care workflow.
          </p>
        </aside>
        <div className="paper">
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <p className="eyebrow">STEP {step} OF 3</p>
              <h2>
                {step === 1
                  ? "Start with the essentials."
                  : step === 2
                    ? "Help us understand your needs."
                    : "Everything look right?"}
              </h2>
              {step === 1 ? (
                <>
                  <Field label="What kind of care?">
                    <select
                      value={data.service}
                      onChange={(e) => update("service", e.target.value)}
                    >
                      {services.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <div className="form-grid">
                    <Field label="Pune locality">
                      <select
                        value={data.locality}
                        onChange={(e) => update("locality", e.target.value)}
                      >
                        <option value="">Choose a locality</option>
                        {areas.map((a) => (
                          <option key={a}>{a}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Preferred start date">
                      <input
                        type="date"
                        min={new Date().toISOString().slice(0, 10)}
                        value={data.startDate}
                        onChange={(e) => update("startDate", e.target.value)}
                      />
                    </Field>
                    <Field label="Preferred shift">
                      <select
                        value={data.shift}
                        onChange={(e) => update("shift", e.target.value)}
                      >
                        {["Day", "Night", "12-hour", "24-hour coverage"].map(
                          (x) => (
                            <option key={x}>{x}</option>
                          ),
                        )}
                      </select>
                    </Field>
                    <Field label="Estimated duration (days)">
                      <input
                        type="number"
                        min={1}
                        max={365}
                        value={data.duration}
                        onChange={(e) =>
                          update("duration", Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>
                  {!user && (
                    <p className="notice">
                      Next, we’ll ask you to sign in or create an account to
                      protect your detailed request. Your service and locality
                      choices will be kept.
                    </p>
                  )}
                </>
              ) : step === 2 ? (
                <>
                  <Field label="Patient’s preferred name">
                    <input
                      value={data.preferredName}
                      maxLength={80}
                      onChange={(e) => update("preferredName", e.target.value)}
                    />
                  </Field>
                  <Field label="Relevant support needs (optional)">
                    <textarea
                      value={data.instructions}
                      maxLength={1500}
                      onChange={(e) => update("instructions", e.target.value)}
                      placeholder="Mobility, daily routines, preferred language or accessibility needs. Avoid full medical records or identity numbers."
                    />
                  </Field>
                  <p className="notice">
                    Only share information necessary to coordinate care. This
                    form does not replace a medical assessment.
                  </p>
                </>
              ) : (
                <>
                  <dl className="review-list">
                    {[
                      [
                        "Service",
                        services.find((s) => s.slug === data.service)?.name,
                      ],
                      ["Locality", data.locality],
                      ["Start date", data.startDate],
                      ["Shift", data.shift],
                      ["Duration", `${data.duration} days`],
                      ["Preferred name", data.preferredName],
                      ["Support needs", data.instructions || "Not provided"],
                      ["Pricing", "Personalized quote after assessment"],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                  <p>
                    Your request is subject to assessment, availability, quote
                    acceptance and a separate service agreement. Read the{" "}
                    <Link to="/booking-terms">booking terms</Link> and{" "}
                    <Link to="/cancellation-policy">cancellation policy</Link>.
                  </p>
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={data.consent}
                      onChange={(e) => update("consent", e.target.checked)}
                    />
                    I am authorized to request this care and consent to the
                    minimum necessary processing explained in the{" "}
                    <Link to="/privacy-policy">privacy notice</Link>.
                  </label>
                </>
              )}
              {error && <ErrorState error={new Error(error)} />}
              <div className="form-actions">
                {step > 1 && (
                  <button
                    className="button secondary"
                    onClick={() => setStep(step - 1)}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                )}
                <button className="button" disabled={busy} onClick={next}>
                  {busy
                    ? "Submitting…"
                    : step === 3
                      ? "Submit care request"
                      : "Continue"}
                  <ArrowUpRight size={17} />
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
export function NotFound() {
  return (
    <section className="container section narrow">
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>Let’s get you back to familiar ground.</h1>
      <Link className="button" to="/">
        Back to home
      </Link>
    </section>
  );
}
