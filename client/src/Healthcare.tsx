import { CompanyDetails } from "./CompanyDetails";
import { CarePhoto } from "./HealthcareLayout";
import { PublicBlocks } from "./PublicContent";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  CalendarDays,
  X,
  Phone,
  Check,
  Search,
} from "lucide-react";
import { api } from "./api";
import { ErrorState, Loading } from "./components";
import { useLanguage, copy, type Copy } from "./i18n";
import { serviceContent } from "./serviceContent";
import { services, areas } from "../../shared/catalog";
import { EnquiryForm } from "./EnquiryForm";

type Service = (typeof services)[number] & {
  _id?: string;
  image?: string;
  featured?: boolean;
  translations?: Record<
    string,
    { name: string; summary: string; description: string }
  >;
};
function serviceText(
  service: Service,
  field: "name" | "summary" | "description",
  language: string,
) {
  const builtIn = serviceContent[service.slug];
  return language === "en"
    ? service[field]
    : service.translations?.[language]?.[field] ||
        (builtIn
          ? builtIn[field === "description" ? "summary" : field][
              language === "hi" ? 1 : 2
            ]
          : service[field]);
}
export function useServices() {
  return useQuery({
    queryKey: ["services"],
    queryFn: () => api<Service[]>("/services"),
    staleTime: 60000,
  });
}
export function SectionHeading({
  eyebrow,
  title,
  description,
  level = 2,
}: {
  level?: 1 | 2;
  eyebrow: Copy;
  title: Copy;
  description?: Copy;
}) {
  const { t } = useLanguage();
  return (
    <div className="hc-section-heading">
      <p className="eyebrow">{t(eyebrow)}</p>
      {level === 1 ? <h1>{t(title)}</h1> : <h2>{t(title)}</h2>}
      {description && <p>{t(description)}</p>}
    </div>
  );
}
export function HealthcareCards({
  limit,
  featuredFirst = false,
  category = "all",
  search = "",
}: {
  limit?: number;
  featuredFirst?: boolean;
  category?: string;
  search?: string;
}) {
  const { t, language } = useLanguage();
  const { data, isLoading, error, refetch } = useServices();
  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} retry={() => void refetch()} />;
  const filtered = (data || []).filter(
    (s) =>
      (category === "all" ||
        (category === "clinical" ? s.clinical : !s.clinical)) &&
      `${serviceText(s, "name", language)} ${serviceText(s, "summary", language)} ${s.name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  if (featuredFirst)
    filtered.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  if (!filtered.length)
    return (
      <p role="status">
        {t([
          "No matching services. Try another search or ask our team.",
          "कोई सेवा नहीं मिली। दूसरी खोज करें या हमारी टीम से पूछें।",
          "जुळणारी सेवा सापडली नाही. दुसरा शोध घ्या किंवा आमच्या संघाला विचारा.",
        ])}
      </p>
    );
  return (
    <div className="hc-card-grid">
      {filtered.slice(0, limit).map((s, i) => {
        const c = serviceContent[s.slug];
        return (
          <motion.article
            key={s.slug}
            className="hc-service-card"
            initial={false}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: (i % 3) * 0.05 }}
          >
            <Link
              to={`/services/${s.slug}`}
              aria-label={`${t(copy.details)}: ${serviceText(s, "name", language)}`}
            >
              <CarePhoto slug={s.image || c?.image || "home-nursing"} />
            </Link>
            <div className="hc-card-body">
              <span className="hc-tag">
                {t(s.clinical ? copy.clinical : copy.everyday)}
              </span>
              {s.featured && (
                <span className="hc-tag">
                  {t(["Featured care", "विशेष देखभाल", "विशेष देखभाल"])}
                </span>
              )}
              <h3>{serviceText(s, "name", language)}</h3>
              <p>{serviceText(s, "summary", language)}</p>
              <ul>
                {c?.highlights.map((h, j) => (
                  <li key={j}>
                    <Check size={15} />
                    {t(h)}
                  </li>
                ))}
              </ul>
              <div className="hc-card-actions">
                <Link
                  className="button small"
                  to={`/enquire?service=${s.slug}`}
                >
                  {t(copy.enquire)}
                  <ArrowUpRight size={15} />
                </Link>
                <Link to={`/services/${s.slug}`}>{t(copy.details)}</Link>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
export function HealthcareHome() {
  const { t } = useLanguage();
  return (
    <div className="hc-site">
      <div className="container">
        <PublicBlocks kind="banner" />
      </div>
      <section className="hc-hero">
        <div className="container hc-hero-grid">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <p className="eyebrow">
              {t([
                "ATHARV ENTERPRISES · PUNE · GOVT. REG. 2231000316316095",
                "अथर्व एंटरप्राइजेज · पुणे · शासकीय पंजी. 2231000316316095",
                "अथर्व एंटरप्रायझेस · पुणे · शासकीय नोंदणी क्र. २२३१०००३१६३१६०९५",
              ])}
            </p>
            <h1>
              {t([
                "Compassionate care. Right at home.",
                "अपनापन भरी देखभाल। आपके घर पर।",
                "आपुलकीची देखभाल. आपल्या घरी.",
              ])}
            </h1>
            <p className="hc-lead">
              {t([
                "Home nursing, everyday assistance and recovery support, coordinated around your family’s needs.",
                "आपके परिवार की जरूरतों के अनुसार घर पर नर्सिंग, दैनिक सहायता और स्वास्थ्य लाभ में सहयोग।",
                "आपल्या कुटुंबाच्या गरजांनुसार घरगुती नर्सिंग, दैनंदिन मदत आणि बरे होण्यासाठी सहाय्य.",
              ])}
            </p>
            <div className="hc-actions">
              <Link className="button" to="/enquire">
                {t(copy.enquire)}
                <ArrowUpRight size={19} />
              </Link>
              <Link className="button secondary" to="/find-care">
                {t([
                  "Help me choose care",
                  "देखभाल चुनने में मदद करें",
                  "देखभाल निवडण्यास मदत करा",
                ])}
              </Link>
            </div>
            <p className="hc-hero-note">
              <ShieldCheck size={18} />
              {t(copy.quote)}
            </p>
          </motion.div>
          <div className="hc-hero-image">
            <CarePhoto slug="hero" hero />
            <div className="hc-image-badge">
              <HeartPulse />
              <span>
                {t([
                  "A personal plan. A familiar place.",
                  "व्यक्तिगत योजना। अपना घर।",
                  "वैयक्तिक योजना. ओळखीचे घर.",
                ])}
              </span>
            </div>
          </div>
        </div>
      </section>
      <div className="hc-trust container">
        {[
          [
            ShieldCheck,
            [
              "Govt. Reg. No. 2231000316316095",
              "शासकीय पंजीकृत: 2231000316316095",
              "शासकीय नोंदणी क्र. २२३१०००३१६३१६०९५",
            ],
          ],
          [
            ShieldCheck,
            [
              "Clear scope & agreements",
              "स्पष्ट सेवा और सहमति",
              "स्पष्ट सेवा आणि करार",
            ],
          ],
          [
            HeartPulse,
            [
              "Care around your needs",
              "आपकी जरूरतों के अनुसार देखभाल",
              "आपल्या गरजांनुसार देखभाल",
            ],
          ],
          [
            CalendarDays,
            [
              "Coordinated care schedules",
              "समन्वित देखभाल शिफ्ट",
              "समन्वित देखभालीच्या पाळ्या",
            ],
          ],
        ].map(([Icon, label], i) => {
          const I = Icon as typeof HeartPulse;
          return (
            <div key={i}>
              <I />
              <span>{t(label as unknown as Copy)}</span>
            </div>
          );
        })}
      </div>
      <section className="container hc-section">
        <SectionHeading
          eyebrow={[
            "CARE FOR YOUR FAMILY",
            "आपके परिवार के लिए देखभाल",
            "आपल्या कुटुंबासाठी देखभाल",
          ]}
          title={[
            "The right support starts with understanding.",
            "सही देखभाल की शुरुआत आपकी जरूरतें समझने से होती है।",
            "योग्य देखभालीची सुरुवात आपल्या गरजा समजून घेण्यापासून होते.",
          ]}
          description={[
            "We coordinate home nursing and everyday care in Pune. Explore the scope, discuss your needs, and review your plan before confirming.",
            "हम पुणे में घर पर नर्सिंग और दैनिक देखभाल का समन्वय करते हैं। सेवाएँ समझें, अपनी जरूरतें बताएँ और पुष्टि से पहले योजना देखें।",
            "आम्ही पुण्यात घरगुती नर्सिंग आणि दैनंदिन देखभालीचा समन्वय करतो. सेवा समजून घ्या, गरजा सांगा आणि निश्चित करण्यापूर्वी योजना पाहा.",
          ]}
        />
        <Link className="text-link" to="/about">
          {t(copy.about)}
          <ArrowRight size={16} />
        </Link>
      </section>
      <section className="hc-soft">
        <div className="container hc-section">
          <SectionHeading
            eyebrow={["OUR SERVICES", "हमारी सेवाएँ", "आमच्या सेवा"]}
            title={[
              "Thoughtful support for every stage.",
              "हर चरण में संवेदनशील सहयोग।",
              "प्रत्येक टप्प्यावर संवेदनशील सहाय्य.",
            ]}
          />
          <HealthcareCards featuredFirst />
          <div className="hc-center">
            <Link className="button secondary" to="/services">
              {t(copy.all)}
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container hc-section">
        <SectionHeading
          eyebrow={["WHY ATHARV", "अथर्व क्यों चुनें", "अथर्व का निवडावे"]}
          title={[
            "Clear expectations. Care with dignity.",
            "स्पष्ट जानकारी। सम्मानपूर्ण देखभाल।",
            "स्पष्ट अपेक्षा. सन्मानपूर्वक देखभाल.",
          ]}
        />
        <div className="hc-benefits">
          {[
            [
              [
                "Personal care plan",
                "व्यक्तिगत देखभाल योजना",
                "वैयक्तिक देखभाल योजना",
              ],
              [
                "Your needs, preferences and locality guide the assessment.",
                "आकलन आपकी जरूरतों, पसंद और क्षेत्र के अनुसार होता है।",
                "आपल्या गरजा, पसंती आणि परिसरानुसार मूल्यांकन होते.",
              ],
            ],
            [
              [
                "Defined responsibilities",
                "स्पष्ट जिम्मेदारियाँ",
                "स्पष्ट जबाबदाऱ्या",
              ],
              [
                "Nursing and non-clinical support have distinct scopes.",
                "नर्सिंग और गैर-चिकित्सकीय सहायता का दायरा अलग है।",
                "नर्सिंग आणि गैर-वैद्यकीय सहाय्याच्या कार्यकक्षा वेगळ्या आहेत.",
              ],
            ],
            [
              [
                "A quote before confirmation",
                "पुष्टि से पहले शुल्क प्रस्ताव",
                "निश्चितीपूर्वी शुल्क प्रस्ताव",
              ],
              [
                "Review charges and agreements before accepting care.",
                "देखभाल स्वीकार करने से पहले शुल्क और सहमति पढ़ें।",
                "देखभाल स्वीकारण्यापूर्वी शुल्क आणि करार वाचा.",
              ],
            ],
          ].map(([heading, body], i) => (
            <article key={i}>
              <ShieldCheck />
              <h3>{t(heading as unknown as Copy)}</h3>
              <p>{t(body as unknown as Copy)}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="hc-soft">
        <div className="container hc-section">
          <CareSteps />
        </div>
      </section>
      <section className="container hc-section">
        <SectionHeading
          eyebrow={["CLOSER TO HOME", "घर के करीब", "घराच्या जवळ"]}
          title={[
            "Care coordination across Pune.",
            "पुणे में देखभाल समन्वय।",
            "पुण्यात देखभाल समन्वय.",
          ]}
          description={[
            "Share your locality. Availability is confirmed individually before booking.",
            "अपना क्षेत्र बताएँ। बुकिंग से पहले उपलब्धता की अलग से पुष्टि होगी।",
            "आपला परिसर सांगा. बुकिंगपूर्वी उपलब्धता स्वतंत्रपणे निश्चित केली जाईल.",
          ]}
        />
        <div className="hc-area-list">
          {areas.map((a) => (
            <Link key={a} to={`/enquire?locality=${encodeURIComponent(a)}`}>
              {a}
            </Link>
          ))}
        </div>
      </section>
      <section className="container hc-section">
        <PublicBlocks kind="testimonial" />
      </section>
      <section className="container hc-section">
        <SectionHeading
          eyebrow={[
            "A LOOK AT HOME CARE",
            "घर की देखभाल की झलक",
            "घरगुती देखभालीची झलक",
          ]}
          title={[
            "Support in familiar surroundings.",
            "परिचित वातावरण में सहायता।",
            "ओळखीच्या वातावरणात सहाय्य.",
          ]}
        />
        <div className="hc-gallery-preview">
          {["elderly-care", "patient-attendant", "post-operative-care"].map(
            (s) => (
              <CarePhoto key={s} slug={s} />
            ),
          )}
        </div>
        <PublicBlocks kind="gallery" />
        <Link className="text-link" to="/gallery">
          {t(copy.gallery)}
          <ArrowRight size={16} />
        </Link>
      </section>
      <section className="hc-soft">
        <div className="container hc-section">
          <HealthcareFAQ compact />
        </div>
      </section>
      <section className="container hc-section hc-enquiry-layout">
        <div>
          <SectionHeading
            eyebrow={["LET’S TALK", "आइए बात करें", "चला बोलूया"]}
            title={[
              "Tell us what your family needs.",
              "बताएँ, आपके परिवार को क्या चाहिए।",
              "आपल्या कुटुंबाला काय हवे ते सांगा.",
            ]}
            description={copy.quote}
          />
          <p>{t(copy.noPayment)}</p>
          <Link to="/find-care">
            {t(copy.find)}
            <ArrowRight size={16} />
          </Link>
        </div>
        <EnquiryForm />
      </section>
    </div>
  );
}
export function HealthcareServices() {
  const { t } = useLanguage();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  return (
    <div className="container hc-section">
      <p className="eyebrow">{t(copy.services)}</p>
      <h1>
        {t([
          "Find support that fits your needs.",
          "अपनी जरूरतों के अनुसार सहायता चुनें।",
          "आपल्या गरजांनुसार सहाय्य निवडा.",
        ])}
      </h1>
      <p className="hc-lead">{t(copy.quote)}</p>
      <div className="hc-filters">
        <label>
          <Search size={18} />
          <input
            aria-label={t(["Search services", "सेवाएँ खोजें", "सेवा शोधा"])}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t(["Search services…", "सेवाएँ खोजें…", "सेवा शोधा…"])}
          />
        </label>
        <div>
          {[
            ["all", copy.all],
            ["clinical", copy.clinical],
            ["everyday", copy.everyday],
          ].map(([value, label]) => (
            <button
              key={value as string}
              className={category === value ? "selected" : ""}
              aria-pressed={category === value}
              onClick={() => setCategory(value as string)}
            >
              {t(label as unknown as Copy)}
            </button>
          ))}
        </div>
      </div>
      <HealthcareCards category={category} search={search} />
    </div>
  );
}
export function HealthcareDetail() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const {
    data: s,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["service", slug],
    queryFn: () => api<Service>(`/services/${slug}`),
  });
  const c = serviceContent[slug || ""];
  if (isLoading) return <Loading />;
  if (error)
    return (
      <div className="container hc-section">
        <ErrorState error={error} />
        <Link to="/services">{t(copy.all)}</Link>
      </div>
    );
  if (!s) return null;
  return (
    <div className="container hc-section">
      <Link className="text-link" to="/services">
        ← {t(copy.all)}
      </Link>
      <div className="hc-detail">
        <article>
          <h1>{serviceText(s, "name", language)}</h1>
          <p className="hc-lead">{serviceText(s, "description", language)}</p>
          <CarePhoto slug={s.image || c?.image || "home-nursing"} />
          <h2>
            {t([
              "Who may benefit?",
              "यह सेवा किसके लिए है?",
              "ही सेवा कोणासाठी आहे?",
            ])}
          </h2>
          <p>{c ? t(c.audience) : s.description}</p>
          <h2>
            {t([
              "Care highlights",
              "देखभाल की मुख्य बातें",
              "देखभालीची वैशिष्ट्ये",
            ])}
          </h2>
          <ul>
            {c
              ? c.highlights.map((h, i) => <li key={i}>{t(h)}</li>)
              : s.includes.map((h) => <li key={h}>{h}</li>)}
          </ul>
          <h2>
            {t([
              "Scope and scheduling",
              "सेवा का दायरा और समय",
              "सेवेची व्याप्ती आणि वेळापत्रक",
            ])}
          </h2>
          <p>
            {t(
              s.clinical
                ? [
                    "Clinical tasks require appropriately qualified clinical professionals and the treating clinician’s directions. No independent diagnosis or prescribing.",
                    "चिकित्सकीय कार्यों के लिए उचित योग्यताधारी चिकित्सकीय पेशेवर और उपचार करने वाले चिकित्सक के निर्देश आवश्यक हैं। स्वतंत्र निदान या दवा लिखना शामिल नहीं है।",
                    "वैद्यकीय कामांसाठी योग्य पात्रता असलेले वैद्यकीय व्यावसायिक आणि उपचार करणाऱ्या डॉक्टरांच्या सूचना आवश्यक आहेत. स्वतंत्र निदान किंवा औषधे लिहिणे समाविष्ट नाही.",
                  ]
                : [
                    "This service provides non-clinical assistance. Nursing procedures and treatment decisions require a separately qualified clinician.",
                    "यह सेवा गैर-चिकित्सकीय सहायता देती है। नर्सिंग प्रक्रियाओं और उपचार निर्णयों के लिए अलग योग्य चिकित्सक की आवश्यकता होती है।",
                    "ही सेवा गैर-वैद्यकीय सहाय्य देते. नर्सिंग प्रक्रिया आणि उपचार निर्णयांसाठी स्वतंत्र पात्र वैद्यकीय व्यावसायिक आवश्यक आहे.",
                  ],
            )}
          </p>
          <p>
            {t([
              "Request day, night or extended coverage. Extended coverage uses multiple suitable shifts, not one person working continuously. Availability is confirmed after assessment.",
              "दिन, रात या विस्तारित सहायता का अनुरोध करें। लंबी देखभाल में अलग-अलग उपयुक्त शिफ्टें होती हैं, एक व्यक्ति लगातार काम नहीं करता। आकलन के बाद उपलब्धता की पुष्टि होती है।",
              "दिवस, रात्र किंवा विस्तारित सहाय्य मागवा. विस्तारित सेवेसाठी अनेक योग्य पाळ्या असतात; एकच व्यक्ती सलग काम करत नाही. मूल्यांकनानंतर उपलब्धता निश्चित होते.",
            ])}
          </p>
          <p className="notice">{t(copy.emergency)}</p>
        </article>
        <aside className="paper hc-detail-cta">
          <ShieldCheck />
          <h2>
            {t([
              "Start with a conversation.",
              "बातचीत से शुरुआत करें।",
              "संवादाने सुरुवात करा.",
            ])}
          </h2>
          <p>{t(copy.quote)}</p>
          <Link className="button" to={`/enquire?service=${s.slug}`}>
            {t(copy.enquire)}
          </Link>
          <Link
            className="button secondary"
            to={`/request-care?service=${s.slug}`}
          >
            {t([
              "Make a private care request",
              "निजी देखभाल अनुरोध करें",
              "खाजगी देखभाल विनंती करा",
            ])}
          </Link>
          <p>{t(copy.noPayment)}</p>
        </aside>
      </div>
    </div>
  );
}
export function CareSteps({ page = false }: { page?: boolean }) {
  const { t } = useLanguage();
  return (
    <>
      <SectionHeading
        level={page ? 1 : 2}
        eyebrow={["HOW IT WORKS", "प्रक्रिया", "प्रक्रिया"]}
        title={[
          "A clear next step, all the way.",
          "हर चरण में स्पष्ट अगला कदम।",
          "प्रत्येक टप्प्यावर स्पष्ट पुढचे पाऊल.",
        ]}
      />
      <ol className="hc-steps">
        {[
          [
            ["Share your needs", "अपनी जरूरतें बताएँ", "आपल्या गरजा सांगा"],
            [
              "Send an enquiry or ask our team which care may suit your family.",
              "पूछताछ भेजें या हमारी टीम से उपयुक्त देखभाल के बारे में पूछें।",
              "चौकशी पाठवा किंवा योग्य देखभालीबद्दल आमच्या संघाला विचारा.",
            ],
          ],
          [
            [
              "Discuss a care plan",
              "देखभाल योजना पर चर्चा करें",
              "देखभाल योजनेबद्दल चर्चा करा",
            ],
            [
              "The team reviews scope, locality, preferred dates and staff suitability.",
              "टीम सेवा, क्षेत्र, तारीख और उपयुक्त कर्मचारी की समीक्षा करती है।",
              "संघ सेवा, परिसर, तारीख आणि योग्य कर्मचाऱ्यांचे पुनरावलोकन करतो.",
            ],
          ],
          [
            [
              "Review and confirm",
              "पढ़ें और पुष्टि करें",
              "वाचा आणि निश्चित करा",
            ],
            [
              "Accept the quote and required agreement before the booking is confirmed.",
              "बुकिंग की पुष्टि से पहले शुल्क प्रस्ताव और आवश्यक सहमति स्वीकार करें।",
              "बुकिंग निश्चित होण्यापूर्वी शुल्क प्रस्ताव आणि आवश्यक करार स्वीकारा.",
            ],
          ],
          [
            ["Stay connected", "संपर्क में रहें", "संपर्कात रहा"],
            [
              "Use your portal for status, agreements, schedules, bills and support.",
              "स्थिति, सहमति, शिफ्ट, बिल और सहायता के लिए पोर्टल का उपयोग करें।",
              "स्थिती, करार, पाळ्या, बिले आणि मदतीसाठी पोर्टल वापरा.",
            ],
          ],
        ].map(([heading, body], i) => (
          <li key={i}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <h3>{t(heading as unknown as Copy)}</h3>
            <p>{t(body as unknown as Copy)}</p>
          </li>
        ))}
      </ol>
      <Link className="button" to="/enquire">
        {t(copy.enquire)}
        <ArrowUpRight size={16} />
      </Link>
    </>
  );
}
const questions: { q: Copy; a: Copy }[] = [
  {
    q: [
      "How do I request a nurse?",
      "नर्स का अनुरोध कैसे करें?",
      "नर्ससाठी विनंती कशी करावी?",
    ],
    a: [
      "Choose Home nursing and send an enquiry. The team reviews suitability, availability and your treating clinician’s directions before confirming care.",
      "घर पर नर्सिंग चुनकर पूछताछ भेजें। टीम देखभाल की पुष्टि से पहले उपयुक्तता, उपलब्धता और उपचार करने वाले चिकित्सक के निर्देशों की समीक्षा करेगी।",
      "घरगुती नर्सिंग निवडून चौकशी पाठवा. संघ देखभाल निश्चित करण्यापूर्वी योग्यतेचे, उपलब्धतेचे आणि उपचार करणाऱ्या डॉक्टरांच्या सूचनांचे पुनरावलोकन करेल.",
    ],
  },
  {
    q: [
      "How much does care cost?",
      "देखभाल का शुल्क कितना है?",
      "देखभालीचे शुल्क किती आहे?",
    ],
    a: [
      "Charges depend on support needs, staff qualifications, shift duration and locality. You receive a quote before confirmation; no fixed price is promised here.",
      "शुल्क जरूरतों, कर्मचारी की योग्यता, शिफ्ट और क्षेत्र पर निर्भर है। पुष्टि से पहले शुल्क प्रस्ताव दिया जाता है; यहाँ निश्चित कीमत का वादा नहीं है।",
      "शुल्क गरजा, कर्मचाऱ्यांची पात्रता, पाळी आणि परिसरावर अवलंबून असते. निश्चितीपूर्वी शुल्क प्रस्ताव दिला जातो; येथे ठरावीक किंमतीचे आश्वासन नाही.",
    ],
  },
  {
    q: [
      "Can I request day or night care?",
      "क्या दिन या रात की देखभाल मिल सकती है?",
      "दिवस किंवा रात्रीची देखभाल मागवता येईल का?",
    ],
    a: [
      "You may request day, night, 12-hour or extended coverage. The team confirms what is feasible. Extended care uses coordinated shifts and suitable rest periods.",
      "आप दिन, रात, 12 घंटे या विस्तारित सहायता का अनुरोध कर सकते हैं। टीम संभव विकल्प की पुष्टि करती है। विस्तारित देखभाल में अलग शिफ्ट और आराम का समय शामिल है।",
      "दिवस, रात्र, १२ तास किंवा विस्तारित सहाय्य मागवू शकता. संघ शक्य पर्याय निश्चित करतो. विस्तारित देखभालीत वेगवेगळ्या पाळ्या आणि विश्रांती समाविष्ट असते.",
    ],
  },
  {
    q: [
      "How are qualifications checked?",
      "योग्यता की जाँच कैसे होती है?",
      "पात्रता कशी तपासली जाते?",
    ],
    a: [
      "Nursing assignments require the relevant qualifications and current credentials to be checked before assignment. Non-clinical attendants do not independently carry out nursing procedures.",
      "नर्सिंग कार्य सौंपने से पहले संबंधित योग्यता और वर्तमान प्रमाणपत्रों की जाँच जरूरी है। गैर-चिकित्सकीय सहायक स्वतंत्र रूप से नर्सिंग प्रक्रिया नहीं करते।",
      "नर्सिंग काम देण्यापूर्वी संबंधित पात्रता आणि वैध प्रमाणपत्रे तपासणे आवश्यक आहे. गैर-वैद्यकीय सहाय्यक स्वतंत्रपणे नर्सिंग प्रक्रिया करत नाहीत.",
    ],
  },
  {
    q: [
      "How do I cancel or request a replacement?",
      "रद्द या कर्मचारी बदलने का अनुरोध कैसे करें?",
      "रद्द करण्याची किंवा कर्मचारी बदलण्याची विनंती कशी करावी?",
    ],
    a: [
      "Use Support in your care portal. The team reviews your agreement and any handover requirements. Submitting a support request does not automatically change a confirmed booking.",
      "केयर पोर्टल में सहायता का उपयोग करें। टीम सहमति और सुरक्षित हैंडओवर की समीक्षा करेगी। सहायता अनुरोध भेजने से बुकिंग अपने आप नहीं बदलती।",
      "केअर पोर्टलमधील सहाय्य वापरा. संघ करार आणि सुरक्षित हस्तांतरणाची गरज तपासेल. सहाय्य विनंती पाठवल्याने बुकिंग आपोआप बदलत नाही.",
    ],
  },
  {
    q: [
      "Is this an emergency service?",
      "क्या यह आपातकालीन सेवा है?",
      "ही आपत्कालीन सेवा आहे का?",
    ],
    a: copy.emergency,
  },
];
export function HealthcareFAQ({
  compact = false,
  page = false,
}: {
  compact?: boolean;
  page?: boolean;
}) {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? questions.filter((item) =>
        `${t(item.q)} ${t(item.a)}`
          .toLocaleLowerCase()
          .includes(search.trim().toLocaleLowerCase()),
      )
    : questions.slice(0, compact ? 4 : undefined);
  return (
    <>
      <SectionHeading
        level={page ? 1 : 2}
        eyebrow={[
          "YOUR QUESTIONS, ANSWERED",
          "आपके सवालों के जवाब",
          "आपल्या प्रश्नांची उत्तरे",
        ]}
        title={[
          "Good to know before you begin.",
          "शुरू करने से पहले जानें।",
          "सुरुवात करण्यापूर्वी जाणून घ्या.",
        ]}
      />
      <div className="hc-faq">
        <label className="field">
          {t([
            "Search care questions",
            "देखभाल के प्रश्न खोजें",
            "देखभालीचे प्रश्न शोधा",
          ])}
          <input
            aria-label={t([
              "Search care questions",
              "देखभाल के प्रश्न खोजें",
              "देखभालीचे प्रश्न शोधा",
            ])}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        {!filtered.length && (
          <p role="status">
            {t([
              "No matching questions.",
              "कोई प्रश्न नहीं मिला।",
              "जुळणारा प्रश्न सापडला नाही.",
            ])}
          </p>
        )}
        {filtered.map((item, i) => (
          <details key={i}>
            <summary>{t(item.q)}</summary>
            <p>{t(item.a)}</p>
          </details>
        ))}
      </div>
      <PublicBlocks kind="faq" />
      {compact && (
        <Link className="text-link" to="/faq">
          {t(["All questions", "सभी प्रश्न", "सर्व प्रश्न"])}
          <ArrowRight size={16} />
        </Link>
      )}
    </>
  );
}
export function HealthcareContact() {
  const { t } = useLanguage();
  const { data: s } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/public/settings"),
  });
  return (
    <section className="container hc-section hc-enquiry-layout">
      <div>
        <p className="eyebrow">{t(copy.contact)}</p>
        <h1>
          {t([
            "Care starts with listening.",
            "देखभाल की शुरुआत सुनने से होती है।",
            "देखभालीची सुरुवात ऐकण्यापासून होते.",
          ])}
        </h1>
        <p className="hc-lead">
          {t([
            "Tell us the support you need. We’ll review your enquiry and discuss the next step.",
            "अपनी सहायता की जरूरत बताएँ। हम पूछताछ की समीक्षा करके अगले कदम पर चर्चा करेंगे।",
            "आपल्याला आवश्यक सहाय्य सांगा. आम्ही चौकशीचे पुनरावलोकन करून पुढील टप्प्यावर चर्चा करू.",
          ])}
        </p>
        <p>{s?.location || "Pune, Maharashtra"}</p>
        {s?.address && <p>{s.address}</p>}
        {s?.mapUrl && (
          <p>
            <a href={s.mapUrl} target="_blank" rel="noopener noreferrer">
              {t([
                "View location on map",
                "मानचित्र पर पता देखें",
                "नकाशावर ठिकाण पाहा",
              ])}
            </a>
          </p>
        )}
        {s?.phone && (
          <p>
            <a href={`tel:${s.phone}`}>
              <Phone size={18} />
              {s.phone}
            </a>
          </p>
        )}
        {s?.email && (
          <p>
            <a href={`mailto:${s.email}`}>{s.email}</a>
          </p>
        )}
        <p className="notice">{t(copy.emergency)}</p>
        <CompanyDetails />
        <PublicBlocks kind="contact" />
        <CarePhoto slug="hero" />
      </div>
      <EnquiryForm />
    </section>
  );
}
export function HealthcareAbout() {
  const { t } = useLanguage();
  return (
    <section className="container hc-section">
      <p className="eyebrow">{t(copy.about)}</p>
      <h1>
        {t([
          "Thoughtful care, built around people.",
          "लोगों की जरूरतों पर आधारित संवेदनशील देखभाल।",
          "माणसांच्या गरजांवर आधारित संवेदनशील देखभाल.",
        ])}
      </h1>
      <CompanyDetails />
      <PublicBlocks kind="about" />
      <div className="hc-enquiry-layout">
        <CarePhoto slug="elderly-care" />
        <div>
          <h2>{t(["Our purpose", "हमारा उद्देश्य", "आमचे ध्येय"])}</h2>
          <p>
            {t([
              "Atharv Enterprises coordinates home nursing and everyday support in Pune, helping families understand care options and plan the next step with clear expectations.",
              "अथर्व एंटरप्राइजेज पुणे में घर पर नर्सिंग और दैनिक सहायता का समन्वय करता है, ताकि परिवार देखभाल के विकल्प समझ सकें और स्पष्ट जानकारी के साथ अगला कदम तय कर सकें।",
              "अथर्व एंटरप्रायझेस पुण्यात घरगुती नर्सिंग आणि दैनंदिन सहाय्याचा समन्वय करते, ज्यामुळे कुटुंबांना देखभालीचे पर्याय समजून स्पष्ट माहितीसह पुढील पाऊल ठरवता येते.",
            ])}
          </p>
          <h2>
            {t([
              "Our care philosophy",
              "हमारी देखभाल की सोच",
              "आमचा देखभालीचा दृष्टिकोन",
            ])}
          </h2>
          <p>
            {t([
              "Dignity, family involvement and a defined scope of support come first. Clinical work requires the appropriate professional, while everyday assistance is coordinated around the person’s routines and preferences.",
              "सम्मान, परिवार की भागीदारी और सहायता का स्पष्ट दायरा प्राथमिक हैं। चिकित्सकीय कार्य के लिए योग्य पेशेवर आवश्यक है; दैनिक सहायता व्यक्ति की दिनचर्या और पसंद के अनुसार होती है।",
              "सन्मान, कुटुंबाचा सहभाग आणि सहाय्याची स्पष्ट व्याप्ती यांना प्राधान्य आहे. वैद्यकीय कामासाठी योग्य व्यावसायिक आवश्यक आहे; दैनंदिन सहाय्य व्यक्तीच्या दिनचर्येनुसार आणि पसंतीनुसार असते.",
            ])}
          </p>
          <p>{t(copy.quote)}</p>
          <Link className="button" to="/find-care">
            {t(copy.find)}
          </Link>
        </div>
      </div>
    </section>
  );
}
export function HealthcareGuide() {
  const { t, language } = useLanguage();
  const [selected, setSelected] = useState("");
  const { data = [] } = useServices();
  const chosen = data.find((service) => service.slug === selected);
  return (
    <section className="container hc-section">
      <p className="eyebrow">
        {t([
          "NEW HERE? START HERE",
          "पहली बार आए हैं? यहाँ शुरू करें",
          "प्रथमच आला आहात? येथे सुरुवात करा",
        ])}
      </p>
      <h1>
        {t([
          "Let’s find your next step.",
          "आइए आपका अगला कदम चुनें।",
          "चला आपले पुढचे पाऊल निवडूया.",
        ])}
      </h1>
      <p className="hc-lead">
        {t([
          "Explore without an account. Select the support you want to learn about.",
          "बिना खाते के जानकारी लें। वह सहायता चुनें जिसके बारे में आप जानना चाहते हैं।",
          "खाते न उघडता माहिती घ्या. ज्या सहाय्याबद्दल जाणून घ्यायचे आहे ते निवडा.",
        ])}
      </p>
      <fieldset className="hc-guide-options">
        <legend>
          {t([
            "What support are you looking for?",
            "आपको किस सहायता की जरूरत है?",
            "आपल्याला कोणते सहाय्य हवे आहे?",
          ])}
        </legend>
        {data.map((s) => (
          <label key={s.slug}>
            <input
              type="radio"
              name="support"
              checked={selected === s.slug}
              onChange={() => setSelected(s.slug)}
            />
            <span>
              <strong>{serviceText(s, "name", language)}</strong>
              <span>{serviceText(s, "summary", language)}</span>
            </span>
          </label>
        ))}
        <label>
          <input
            type="radio"
            name="support"
            checked={selected === "unsure"}
            onChange={() => setSelected("unsure")}
          />
          {t(["I’m not sure yet", "अभी निश्चित नहीं हूँ", "अजून ठरवलेले नाही"])}
        </label>
      </fieldset>
      <div className="paper">
        <h2>
          {chosen
            ? serviceText(chosen, "name", language)
            : t([
                "Talk through your options",
                "अपने विकल्पों पर चर्चा करें",
                "आपल्या पर्यायांबद्दल चर्चा करा",
              ])}
        </h2>
        <div className="hc-actions">
          <Link
            className="button"
            to={
              selected && selected !== "unsure"
                ? `/enquire?service=${selected}`
                : "/contact"
            }
          >
            {t(copy.enquire)}
          </Link>
          {chosen && (
            <Link className="button secondary" to={`/services/${selected}`}>
              {t(copy.details)}
            </Link>
          )}
        </div>
        <p>{t(copy.noPayment)}</p>
      </div>
      <div className="hc-section">
        <CareSteps />
      </div>
    </section>
  );
}
export function HealthcareGallery() {
  const { t, language } = useLanguage();
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState<Service | null>(null);
  const { data: published = [] } = useServices();
  return (
    <section className="container hc-section">
      <p className="eyebrow">{t(copy.gallery)}</p>
      <h1>
        {t([
          "A glimpse of care at home.",
          "घर की देखभाल की एक झलक।",
          "घरगुती देखभालीची एक झलक.",
        ])}
      </h1>
      <p className="hc-lead">{t(copy.ai)}</p>
      <div className="hc-filters">
        <div>
          {[
            ["all", copy.all],
            ["clinical", copy.clinical],
            ["everyday", copy.everyday],
          ].map(([value, label]) => (
            <button
              key={value as string}
              aria-pressed={filter === value}
              className={filter === value ? "selected" : ""}
              onClick={() => setFilter(value as string)}
            >
              {t(label as unknown as Copy)}
            </button>
          ))}
        </div>
      </div>
      <div className="hc-card-grid">
        {published
          .filter(
            (s) =>
              filter === "all" ||
              (filter === "clinical" ? s.clinical : !s.clinical),
          )
          .map((s) => (
            <button
              className="hc-gallery-button"
              key={s.slug}
              onClick={() => setActive(s)}
              aria-label={`${t(copy.details)}: ${serviceText(s, "name", language)}`}
            >
              <CarePhoto
                slug={s.image || serviceContent[s.slug]?.image || s.slug}
              />
              <strong>{serviceText(s, "name", language)}</strong>
            </button>
          ))}
      </div>
      <PublicBlocks kind="gallery" />
      {active && (
        <GalleryDialog service={active} close={() => setActive(null)} />
      )}
    </section>
  );
}
function GalleryDialog({
  service,
  close,
}: {
  service: Service;
  close: () => void;
}) {
  const { t, language } = useLanguage();
  return (
    <dialog
      className="hc-lightbox"
      aria-labelledby="gallery-title"
      ref={(element) => {
        if (element && !element.open) element.showModal();
      }}
      onCancel={close}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <button
        autoFocus
        className="icon-button"
        aria-label={t(["Close image", "चित्र बंद करें", "छायाचित्र बंद करा"])}
        onClick={close}
      >
        <X />
      </button>
      <CarePhoto
        slug={
          service.image || serviceContent[service.slug]?.image || service.slug
        }
      />
      <h2 id="gallery-title">{serviceText(service, "name", language)}</h2>
    </dialog>
  );
}
export function ProcessPage() {
  return (
    <section className="container hc-section">
      <CareSteps page />
    </section>
  );
}
export function FAQPage() {
  return (
    <section className="container hc-section">
      <HealthcareFAQ page />
    </section>
  );
}
export function EnquiryPage() {
  const [params] = useSearchParams();
  return <HealthcareContact key={params.get("service") || "general"} />;
}
