import { useEffect } from "react";
import { useLanguage, type Copy } from "./i18n";
import { serviceContent } from "./serviceContent";
import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
const pages: Record<string, Copy> = {
  "/": [
    "Home nursing and care in Pune",
    "पुणे में घर पर नर्सिंग और देखभाल",
    "पुण्यात घरगुती नर्सिंग आणि देखभाल",
  ],
  "/services": [
    "Our care services",
    "हमारी देखभाल सेवाएँ",
    "आमच्या देखभाल सेवा",
  ],
  "/find-care": [
    "Find the right care",
    "सही देखभाल चुनें",
    "योग्य देखभाल निवडा",
  ],
  "/enquire": [
    "Enquire about home care",
    "घर की देखभाल की पूछताछ",
    "घरगुती देखभालीची चौकशी",
  ],
  "/contact": [
    "Contact our care team",
    "हमारी देखभाल टीम से संपर्क करें",
    "आमच्या देखभाल संघाशी संपर्क करा",
  ],
  "/about": [
    "About Atharv Enterprises",
    "अथर्व एंटरप्राइजेज के बारे में",
    "अथर्व एंटरप्रायझेसबद्दल",
  ],
  "/how-it-works": [
    "How care is arranged",
    "देखभाल की प्रक्रिया",
    "देखभालीची प्रक्रिया",
  ],
  "/faq": [
    "Home care questions",
    "घर की देखभाल के प्रश्न",
    "घरगुती देखभालीचे प्रश्न",
  ],
  "/gallery": [
    "Home care gallery",
    "घर की देखभाल गैलरी",
    "घरगुती देखभालीची छायाचित्रे",
  ],
  "/resources": [
    "Family care guides",
    "परिवार के लिए देखभाल मार्गदर्शन",
    "कुटुंबासाठी देखभाल मार्गदर्शन",
  ],
  "/login": [
    "Sign in to your care portal",
    "केयर पोर्टल में साइन इन करें",
    "केअर पोर्टलमध्ये प्रवेश करा",
  ],
  "/request-care": ["Request care", "देखभाल अनुरोध", "देखभाल विनंती"],
  "/portal": ["Your care portal", "आपका केयर पोर्टल", "आपले केअर पोर्टल"],
};
export function usePageMetadata(path: string) {
  const { language, t } = useLanguage();
  const slug = path.startsWith("/services/")
    ? path.split("/").pop()
    : undefined;
  const { data: serviceRecord } = useQuery({
    queryKey: ["service", slug],
    queryFn: () => api<any>(`/services/${slug}`),
    enabled: !!slug,
  });
  const service = path.startsWith("/services/")
    ? serviceContent[path.split("/").pop() || ""]
    : null;
  const defaultTitle = t(
    service?.name ||
      pages[path] || [
        path.split("/").pop()?.replaceAll("-", " ") || "Atharv Enterprises",
        "अथर्व एंटरप्राइजेज",
        "अथर्व एंटरप्रायझेस",
      ],
  );
  const title = serviceRecord
    ? language === "en"
      ? serviceRecord.seoTitle || serviceRecord.name
      : serviceRecord.translations?.[language]?.name || defaultTitle
    : defaultTitle;
  const defaultDescription = service
    ? t(service.summary)
    : title +
      ". " +
      t([
        "Explore home nursing and everyday support in Pune. Enquire in English, Hindi or Marathi.",
        "पुणे में घर पर नर्सिंग और दैनिक सहायता देखें। हिंदी, मराठी या अंग्रेज़ी में पूछताछ करें।",
        "पुण्यात घरगुती नर्सिंग आणि दैनंदिन सहाय्य पाहा. मराठी, हिंदी किंवा इंग्रजीमध्ये चौकशी करा.",
      ]);
  const description = serviceRecord
    ? language === "en"
      ? serviceRecord.seoDescription || serviceRecord.summary
      : serviceRecord.translations?.[language]?.summary || defaultDescription
    : defaultDescription;

  useEffect(() => {
    document.title = title + " | Atharv Enterprises";
    const canonical = window.location.origin + path;
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = canonical;
    const meta = (key: string, value: string, property = false) => {
      const attr = property ? "property" : "name";
      let element = document.querySelector<HTMLMetaElement>(
        `meta[${attr}="${key}"]`,
      );
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.content = value;
    };
    meta("description", description);
    meta("og:title", document.title, true);
    meta("og:description", description, true);
    meta("og:type", "website", true);
    meta("og:url", canonical, true);
    meta(
      "og:image",
      window.location.origin + "/images/healthcare/hero.webp",
      true,
    );
    meta(
      "og:locale",
      { en: "en_IN", hi: "hi_IN", mr: "mr_IN" }[language],
      true,
    );
    meta("twitter:card", "summary_large_image");
    meta(
      "robots",
      /^\/(portal|login|request-care|reset-password)(\/|$)/.test(path)
        ? "noindex, nofollow"
        : "index, follow",
    );
    let schema = document.querySelector<HTMLScriptElement>(
      "#organization-schema",
    );
    if (!schema) {
      schema = document.createElement("script");
      schema.id = "organization-schema";
      schema.type = "application/ld+json";
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Atharv Enterprises",
      url: window.location.origin,
      areaServed: "Pune",
    });
  }, [path, title, description, language]);
}
