import { useId, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowUpRight,
  Eye,
  EyeOff,
  ShieldCheck,
  LockKeyhole,
  Check,
  Mail,
  CalendarDays,
  HeartHandshake,
} from "lucide-react";
import { z } from "zod";
import { loginSchema, registerSchema } from "../../shared/schemas";
import { post } from "./api";
import { Logo } from "./components";
import { Reveal, Illustration } from "./Visual";
export default function AuthExperience({
  standalone = false,
  sessionIssue,
}: {
  standalone?: boolean;
  sessionIssue?: string;
}) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const id = useId();
  const qc = useQueryClient();
  const navigate = useNavigate();
  function change(next: typeof mode) {
    setMode(next);
    setError("");
    setRecoverySent(false);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (mode === "forgot") {
        z.string().email().parse(data.email);
        await post("/auth/forgot-password", { email: data.email });
        setRecoverySent(true);
        return;
      }
      const payload =
        mode === "register"
          ? registerSchema.parse(data)
          : loginSchema.parse(data);
      const user = await post(`/auth/${mode}`, payload);
      qc.setQueryData(["me"], user);
      const destination =
        sessionStorage.getItem("care-return") === "/request-care"
          ? "/request-care"
          : "/portal";
      sessionStorage.removeItem("care-return");
      navigate(destination, { replace: true });
    } catch (e) {
      setError(
        e instanceof z.ZodError
          ? e.issues.map((i) => i.message).join(". ")
          : (e as Error).message,
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`portal-entry ${standalone ? "standalone" : ""}`}>
      {standalone && (
        <div className="portal-entry-nav">
          <Logo />
          <Link to="/">
            <ArrowLeft size={15} /> Back to website
          </Link>
        </div>
      )}
      <div className="portal-entry-layout container">
        <Reveal className="portal-welcome">
          <p className="eyebrow">
            <span className="pulse-dot" /> YOUR CARE. YOUR PEOPLE. ONE PLACE.
          </p>
          <h1>
            A little less worry.
            <br />
            <em>A lot more connection.</em>
          </h1>
          <p>
            Welcome to your Atharv care portal. A thoughtful space to keep your
            care journey organized, and your next step clear.
          </p>
          <div className="portal-welcome-art">
            <img
              src="/images/dashboard/family-care-portal.webp"
              data-family-art
              alt="Illustration of a family and care coordinator planning support together"
              width="400"
              height="280"
            />
            <span className="portal-art-note">
              <HeartHandshake size={21} /> You’re part of the care team, too.
            </span>
          </div>
          <div className="entry-journey">
            {[
              [CalendarDays, "Plan your care"],
              [ShieldCheck, "Review together"],
              [HeartHandshake, "Stay connected"],
            ].map(([Icon, text], i) => {
              const I = Icon as typeof CalendarDays;
              return (
                <div key={String(text)}>
                  <span>
                    <I size={18} />
                  </span>
                  <small>0{i + 1}</small>
                  <b>{String(text)}</b>
                </div>
              );
            })}
          </div>
        </Reveal>
        <Reveal className="entry-form-column" delay={0.12}>
          <div className="signin-card">
            <span className="signin-emblem">
              <HeartHandshake size={27} />
            </span>
            <div className="signin-topline">
              <p className="eyebrow">ATHARV CARE PORTAL</p>
              <span>
                <LockKeyhole size={12} /> Private by design
              </span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h2>
                  {mode === "register"
                    ? "Let’s get you connected."
                    : mode === "forgot"
                      ? "Let’s help you back in."
                      : "It’s good to see you."}
                </h2>
                <p>
                  {mode === "register"
                    ? "Create an account to request and manage care securely."
                    : mode === "forgot"
                      ? "Enter your account email to request a recovery link."
                      : "Sign in to pick up your care journey."}
                </p>
                {sessionIssue && <p className="notice">{sessionIssue}</p>}
                {recoverySent ? (
                  <div className="recovery-success" role="status">
                    <span>
                      <Check size={25} />
                    </span>
                    <h3>Check your inbox.</h3>
                    <p>
                      If an account exists and email delivery is configured,
                      recovery instructions will be sent. Don’t see an email?
                      Contact the care team for help.
                    </p>
                    <button
                      className="button full"
                      onClick={() => change("login")}
                    >
                      Back to sign in <ArrowUpRight size={17} />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submit} aria-busy={busy}>
                    {mode === "register" && (
                      <div className="field">
                        <label htmlFor={`${id}-name`}>Your name</label>
                        <input
                          id={`${id}-name`}
                          name="name"
                          required
                          minLength={2}
                          maxLength={100}
                          autoComplete="name"
                          placeholder="How should we address you?"
                        />
                      </div>
                    )}
                    <div className="field">
                      <label htmlFor={`${id}-email`}>Email address</label>
                      <div className="input-with-icon">
                        <Mail size={17} />
                        <input
                          id={`${id}-email`}
                          name="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          required
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    {mode !== "forgot" && (
                      <div className="field">
                        <div className="password-label">
                          <label htmlFor={`${id}-password`}>Password</label>
                          {mode === "login" && (
                            <button
                              type="button"
                              onClick={() => change("forgot")}
                            >
                              Forgot password?
                            </button>
                          )}
                        </div>
                        <div className="password-input">
                          <LockKeyhole size={17} />
                          <input
                            id={`${id}-password`}
                            name="password"
                            type={visible ? "text" : "password"}
                            minLength={mode === "register" ? 12 : 1}
                            maxLength={128}
                            autoComplete={
                              mode === "register"
                                ? "new-password"
                                : "current-password"
                            }
                            required
                            placeholder={
                              mode === "register"
                                ? "At least 12 characters"
                                : "Enter your password"
                            }
                          />
                          <button
                            type="button"
                            aria-label={
                              visible ? "Hide password" : "Show password"
                            }
                            aria-controls={`${id}-password`}
                            onClick={() => setVisible(!visible)}
                          >
                            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        {mode === "register" && (
                          <small>
                            Use a unique password with at least 12 characters.
                          </small>
                        )}
                      </div>
                    )}
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="notice error"
                        role="alert"
                      >
                        {error}
                      </motion.p>
                    )}
                    <button
                      className="button full signin-submit"
                      disabled={busy}
                    >
                      {busy
                        ? "Please wait…"
                        : mode === "register"
                          ? "Create account"
                          : mode === "forgot"
                            ? "Send recovery instructions"
                            : "Sign in"}
                      <ArrowUpRight size={18} />
                    </button>
                  </form>
                )}
                <div className="signin-register">
                  {mode === "register" ? (
                    <>
                      Already part of the family?{" "}
                      <button onClick={() => change("login")}>Sign in</button>
                    </>
                  ) : mode === "forgot" ? (
                    <button onClick={() => change("login")}>
                      Back to sign in
                    </button>
                  ) : (
                    <>
                      New to Atharv?{" "}
                      <button onClick={() => change("register")}>
                        Create an account
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="signin-security">
              <ShieldCheck size={18} />
              <p>
                Your personal care details stay behind your sign-in. We only
                show information you’re authorized to access.
              </p>
            </div>
          </div>
          <div className="entry-help">
            <Illustration name="contact" />
            <p>
              Just exploring your options?
              <br />
              <Link to="/services">Browse care services</Link> or{" "}
              <Link to="/contact">
                talk to our team <ArrowUpRight size={13} />
              </Link>
            </p>
          </div>
        </Reveal>
      </div>
      {standalone && (
        <div className="portal-entry-bottom">
          <span>© {new Date().getFullYear()} Atharv Enterprises</span>
          <div>
            <Link to="/privacy-policy">Privacy policy</Link>
            <Link to="/accessibility">Accessibility</Link>
            <Link to="/contact">Need a hand?</Link>
          </div>
        </div>
      )}
    </div>
  );
}
