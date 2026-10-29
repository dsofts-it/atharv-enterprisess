import { usePageMetadata } from "./SEO";
import { ResourcesPage } from "./PublicContent";
import { useLanguage } from "./i18n";
import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Loading } from "./components";
import {
  HealthcareHeader,
  HealthcareFooter,
  QuickContact,
} from "./HealthcareLayout";

import { ScrollProgress } from "./ScrollProgress";
import {
  Contact as CareerContact,
  AuthPage,
  ResetPassword,
  RequestCare,
  NotFound,
} from "./Pages";
import Legal, { legalPaths } from "./Legal";
const Home = lazy(() =>
  import("./Healthcare").then((module) => ({ default: module.HealthcareHome })),
);
const Services = lazy(() =>
  import("./Healthcare").then((module) => ({
    default: module.HealthcareServices,
  })),
);
const ServiceDetail = lazy(() =>
  import("./Healthcare").then((module) => ({
    default: module.HealthcareDetail,
  })),
);
const About = lazy(() =>
  import("./Healthcare").then((module) => ({
    default: module.HealthcareAbout,
  })),
);
const HowItWorks = lazy(() =>
  import("./Healthcare").then((module) => ({ default: module.ProcessPage })),
);
const FAQPage = lazy(() =>
  import("./Healthcare").then((module) => ({ default: module.FAQPage })),
);
const Contact = lazy(() =>
  import("./Healthcare").then((module) => ({
    default: module.HealthcareContact,
  })),
);
const FindCare = lazy(() =>
  import("./Healthcare").then((module) => ({
    default: module.HealthcareGuide,
  })),
);
const HealthcareGallery = lazy(() =>
  import("./Healthcare").then((module) => ({
    default: module.HealthcareGallery,
  })),
);
const Portal = lazy(() => import("./Portal"));
export default function App() {
  const { t } = useLanguage();
  const location = useLocation();
  const portal = location.pathname.startsWith("/portal");
  usePageMetadata(location.pathname);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);
  return (
    <>
      <ScrollProgress />
      <a className="skip-link" href="#main">
        {t(["Skip to content", "मुख्य सामग्री पर जाएँ", "मुख्य मजकुराकडे जा"])}
      </a>
      {!portal && <HealthcareHeader />}
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
            <Route path="/enquire" element={<Contact />} />
            <Route path="/gallery" element={<HealthcareGallery />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/careers" element={<CareerContact careers />} />
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
      {!portal && <HealthcareFooter />}
      {!portal && <QuickContact />}
    </>
  );
}
