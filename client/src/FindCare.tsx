import { useState } from "react";
import { Link } from "react-router-dom";
import { services } from "../../shared/catalog";
import { PageIntro } from "./components";
import "./find-care.css";

export default function FindCare() {
  const [selected, setSelected] = useState("");
  const service = services.find((item) => item.slug === selected);
  return (
    <>
      <PageIntro
        eyebrow="NEW HERE? START HERE"
        title="Let’s find your next step."
      >
        Explore your options without an account. Choose the support you want to
        learn about, then decide whether to request care or speak with our team.
      </PageIntro>
      <section className="container section compact care-guide">
        <fieldset className="care-options">
          <legend>
            <h2>What support are you looking for?</h2>
          </legend>
          <p>
            You can change your choice. Our team confirms the appropriate
            support after assessment.
          </p>
          <div className="care-option-grid">
            {services.map((item) => (
              <label
                key={item.slug}
                className={
                  selected === item.slug
                    ? "care-option selected"
                    : "care-option"
                }
              >
                <input
                  type="radio"
                  name="care-option"
                  value={item.slug}
                  checked={selected === item.slug}
                  onChange={() => setSelected(item.slug)}
                />
                <span>
                  <strong>{item.name}</strong>
                  <span>{item.summary}</span>
                </span>
              </label>
            ))}
            <label
              className={
                selected === "unsure" ? "care-option selected" : "care-option"
              }
            >
              <input
                type="radio"
                name="care-option"
                value="unsure"
                checked={selected === "unsure"}
                onChange={() => setSelected("unsure")}
              />
              <span>
                <strong>I’m not sure yet</strong>
                <span>I would like help understanding the options.</span>
              </span>
            </label>
          </div>
        </fieldset>
        <div className="paper care-next" aria-live="polite">
          <h2>
            {service
              ? `Explore ${service.name.toLowerCase()}`
              : selected === "unsure"
                ? "Start with a conversation"
                : "A clear path from questions to care"}
          </h2>
          <p>
            {service
              ? service.description
              : "Learn what we offer, how care is arranged, and what happens after you send a request."}
          </p>
          <div className="form-actions">
            {service ? (
              <>
                <Link
                  className="button"
                  to={`/request-care?service=${service.slug}`}
                >
                  Request this care
                </Link>
                <Link
                  className="button secondary"
                  to={`/services/${service.slug}`}
                >
                  See scope and details
                </Link>
              </>
            ) : (
              <Link
                className="button"
                to={selected === "unsure" ? "/contact" : "/services"}
              >
                {selected === "unsure"
                  ? "Ask the care team"
                  : "Explore all services"}
              </Link>
            )}
            <Link to="/contact">Ask a question without an account</Link>
          </div>
          <p>
            No payment is taken with your request. Sending a request does not
            confirm a caregiver or booking.
          </p>
        </div>
        <h2>What happens next?</h2>
        <ol className="care-journey">
          <li>
            <strong>Explore your options</strong>
            <p>
              Read service details and <Link to="/faq">common questions</Link>.
              No sign-in needed.
            </p>
          </li>
          <li>
            <strong>Tell us the essentials</strong>
            <p>
              Choose your locality, preferred date and shift. Sign in or create
              an account to continue your private request.
            </p>
          </li>
          <li>
            <strong>Review the proposed care</strong>
            <p>
              The team assesses your needs and availability, then shares a quote
              and agreement before confirmation.{" "}
              <Link to="/how-it-works">See the full process</Link>.
            </p>
          </li>
          <li>
            <strong>Follow care in your portal</strong>
            <p>
              Once signed in, view request status, agreements, confirmed
              schedules, billing and support in{" "}
              <Link to="/portal">My care portal</Link>.
            </p>
          </li>
        </ol>
        <p className="notice">
          This website arranges planned care. For an emergency, seek immediate
          medical help rather than waiting for a website response.
        </p>
      </section>
    </>
  );
}
