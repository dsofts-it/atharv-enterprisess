import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Header, Footer, Loading } from "./components";
import Home from "./Home";
import FindCare from "./FindCare";
import { ScrollProgress } from "./ScrollProgress";
import {
  Services,
  ServiceDetail,
  About,
  HowItWorks,
  FAQPage,
  Contact,
  AuthPage,
  ResetPassword,
  RequestCare,
  NotFound,
} from "./Pages";
import Legal, { legalPaths } from "./Legal";
const Portal = lazy(() => import("./Portal"));
export default function App() {
  const location = useLocation();
  const portal = location.pathname.startsWith("/portal");
  useEffect(() => {
    const title =
      location.pathname === "/"
        ? "Thoughtful care, at home"
        : location.pathname
            .split("/")
            .filter(Boolean)
            .pop()
            ?.replaceAll("-", " ") || "Home";
    document.title = `${title.charAt(0).toUpperCase() + title.slice(1)} | Atharv Enterprises`;
    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = window.location.origin + location.pathname;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        `${title}. Home nursing and care coordination from Atharv Enterprises in Pune, Maharashtra.`,
      );
  }, [location.pathname]);
  return (
    <>
      <ScrollProgress />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {!portal && <Header />}
      <main id="main" className="route-enter" key={location.pathname}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find-care" element={<FindCare />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:slug" element={<ServiceDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/careers" element={<Contact careers />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/request-care" element={<RequestCare />} />
            <Route path="/portal/*" element={<Portal />} />
            {legalPaths.map((p) => (
              <Route key={p} path={`/${p}`} element={<Legal page={p} />} />
            ))}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {!portal && <Footer />}
    </>
  );
}
