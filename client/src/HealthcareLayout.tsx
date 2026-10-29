import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, X, Menu, Phone, MessageCircle } from "lucide-react";
import { api, apiUrl } from "./api";
import { Logo } from "./components";
import { useLanguage, copy, LanguageSwitcher, type Copy } from "./i18n";
import { serviceContent } from "./serviceContent";
import { photoDescriptions } from "./photoDescriptions";
export function CarePhoto({
  slug,
  hero = false,
  className = "",
}: {
  slug: string;
  hero?: boolean;
  className?: string;
}) {
  const { t } = useLanguage();
  const mediaId = slug.startsWith("media-") ? slug.slice(6) : "";
  const { language } = useLanguage();
  const { data: media } = useQuery({
    queryKey: ["photo-info", mediaId],
    queryFn: () => api(`/public/media/${mediaId}/info`),
    enabled: !!mediaId,
  });
  const alt: Copy = [
    "Illustrative home care scene in an Indian home",
    "भारतीय घर में देखभाल का उदाहरणात्मक दृश्य",
    "भारतीय घरातील देखभालीचे प्रातिनिधिक दृश्य",
  ];
  return (
    <figure className={`care-photo ${className}`}>
      <img
        src={
          slug.startsWith("media-")
            ? apiUrl(`/public/media/${slug.slice(6)}`)
            : `/images/healthcare/${slug}.webp`
        }
        alt={media?.alt?.[language] || t(photoDescriptions[slug] || alt)}
        loading={hero ? "eager" : "lazy"}
        fetchPriority={hero ? "high" : "auto"}
        width={hero ? 1200 : 720}
        height={hero ? 800 : 480}
      />
      <figcaption>
        {mediaId && media?.illustrative === false
          ? t([
              "Business photograph published with permission.",
              "अनुमति से प्रकाशित व्यवसाय का चित्र।",
              "परवानगीने प्रकाशित केलेले व्यवसायाचे छायाचित्र.",
            ])
          : t(copy.ai)}
      </figcaption>
    </figure>
  );
}
export function HealthcareHeader() {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const { data: published = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<any[]>("/services"),
  });
  const links = [
    ["/", copy.home],
    ["/services", copy.services],
    ["/about", copy.about],
    ["/how-it-works", copy.process],
    ["/gallery", copy.gallery],
    ["/contact", copy.contact],
  ] as const;
  return (
    <>
      <div className="hc-top">
        <div className="container">
          <span>
            {t([
              "Home nursing & everyday support · Pune",
              "घर पर नर्सिंग और दैनिक सहायता · पुणे",
              "घरगुती नर्सिंग आणि दैनंदिन सहाय्य · पुणे",
            ])}
          </span>
          <LanguageSwitcher />
        </div>
      </div>
      <header
        className="hc-header"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            event.currentTarget
              .querySelector("details")
              ?.removeAttribute("open");
          }
        }}
      >
        <div className="container hc-nav">
          <Logo />
          <nav
            aria-label={t([
              "Main navigation",
              "मुख्य नेविगेशन",
              "मुख्य मार्गदर्शन",
            ])}
            className={open ? "hc-links open" : "hc-links"}
          >
            {links.map(([path, label]) =>
              path === "/services" ? (
                <div className="hc-service-menu" key={path}>
                  <NavLink to={path} onClick={() => setOpen(false)}>
                    {t(label)}
                  </NavLink>
                  <details>
                    <summary
                      role="button"
                      aria-label={t([
                        "Toggle services menu",
                        "सेवाओं का मेनू खोलें",
                        "सेवांचा मेनू उघडा",
                      ])}
                    >
                      ⌄
                    </summary>
                    <div id="service-dropdown">
                      {published.map((service) => (
                        <Link
                          key={service.slug}
                          to={`/services/${service.slug}`}
                          onClick={(event) => {
                            setOpen(false);
                            event.currentTarget
                              .closest("details")
                              ?.removeAttribute("open");
                          }}
                        >
                          {language === "en"
                            ? service.name
                            : service.translations?.[language]?.name ||
                              (serviceContent[service.slug]
                                ? t(serviceContent[service.slug].name)
                                : service.name)}
                        </Link>
                      ))}
                    </div>
                  </details>
                </div>
              ) : (
                <NavLink key={path} to={path} onClick={() => setOpen(false)}>
                  {t(label)}
                </NavLink>
              ),
            )}
            <Link to="/portal" onClick={() => setOpen(false)}>
              {t(copy.portal)}
            </Link>
          </nav>
          <Link className="button hc-nav-cta" to="/enquire">
            {t(copy.enquire)}
            <ArrowUpRight size={16} />
          </Link>
          <button
            className="icon-button hc-menu"
            aria-label={t(
              open
                ? ["Close navigation", "मेनू बंद करें", "मेनू बंद करा"]
                : ["Open navigation", "मेनू खोलें", "मेनू उघडा"],
            )}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
    </>
  );
}
export function HealthcareFooter() {
  const { t, language } = useLanguage();
  const { data: published = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => api<any[]>("/services"),
  });
  const { data: s } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/public/settings"),
  });
  return (
    <footer className="hc-footer">
      <div className="container hc-footer-grid">
        <div>
          <Logo />
          <p>
            {t([
              "Care that respects your family, your home and your choices.",
              "आपके परिवार, घर और विकल्पों का सम्मान करने वाली देखभाल।",
              "आपल्या कुटुंबाचा, घराचा आणि निवडीचा आदर करणारी देखभाल.",
            ])}
          </p>
          <p>{s?.location || "Pune, Maharashtra"}</p>
        </div>
        <div>
          <h3>{t(copy.services)}</h3>
          {published.map((s) => (
            <Link key={s.slug} to={`/services/${s.slug}`}>
              {language === "en"
                ? s.name
                : s.translations?.[language]?.name ||
                  (serviceContent[s.slug]
                    ? t(serviceContent[s.slug].name)
                    : s.name)}
            </Link>
          ))}
        </div>
        <div>
          <h3>{t(["Useful links", "उपयोगी लिंक", "उपयुक्त दुवे"])}</h3>
          {[
            [
              "/resources",
              [
                "Family guides",
                "परिवार के लिए मार्गदर्शन",
                "कुटुंबासाठी मार्गदर्शन",
              ],
            ],
            ["/find-care", copy.find],
            ["/faq", ["Common questions", "सामान्य प्रश्न", "नेहमीचे प्रश्न"]],
            ["/how-it-works", copy.process],
            ["/portal", copy.portal],
            [
              "/careers",
              [
                "Join our team",
                "हमारी टीम से जुड़ें",
                "आमच्या संघात सामील व्हा",
              ],
            ],
          ].map(([path, label]) => (
            <Link key={path as string} to={path as string}>
              {t(label as unknown as Copy)}
            </Link>
          ))}
        </div>
        <div>
          <h3>{t(copy.contact)}</h3>
          {s?.phone && <a href={`tel:${s.phone}`}>{s.phone}</a>}
          {s?.email && <a href={`mailto:${s.email}`}>{s.email}</a>}
          <Link to="/contact">
            {t(["Ask our team", "हमारी टीम से पूछें", "आमच्या संघाला विचारा"])}
          </Link>
          <Link to="/privacy-policy">
            {t(["Privacy notice", "गोपनीयता सूचना", "गोपनीयता सूचना"])}
          </Link>
          <Link to="/booking-terms">
            {t(["Booking terms", "बुकिंग की शर्तें", "बुकिंगच्या अटी"])}
          </Link>
          <Link to="/cancellation-policy">
            {t([
              "Cancellation policy",
              "रद्द करने की नीति",
              "रद्द करण्याचे धोरण",
            ])}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
      <div className="container hc-footer-bottom">
        <p>© {new Date().getFullYear()} Atharv Enterprises</p>
        <p>{t(copy.emergency)}</p>
      </div>
    </footer>
  );
}
export function QuickContact() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const { data: s } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api("/public/settings"),
  });
  const digits = s?.whatsapp?.replace(/\D/g, "");
  const number = digits?.length === 10 ? `91${digits}` : digits;
  return (
    <div className="hc-quick">
      {open && (
        <div className="hc-quick-panel">
          <Link className="button" to="/enquire" onClick={() => setOpen(false)}>
            {t(copy.enquire)}
          </Link>
          {s?.phone && (
            <a href={`tel:${s.phone}`}>
              <Phone size={17} />
              {t(["Call the team", "टीम को कॉल करें", "संघाला फोन करा"])}
            </a>
          )}
          {number && (
            <a
              href={`https://wa.me/${number}?text=${encodeURIComponent(t(["Hello Atharv Enterprises, I would like to enquire about home care services.", "नमस्ते अथर्व एंटरप्राइजेज, मुझे घर की देखभाल सेवाओं के बारे में जानकारी चाहिए।", "नमस्कार अथर्व एंटरप्रायझेस, मला घरगुती देखभाल सेवांबद्दल माहिती हवी आहे."]))}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      )}
      <button
        className="button"
        aria-expanded={open}
        aria-label={t(copy.contact)}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span>{t(copy.contact)}</span>
      </button>
    </div>
  );
}
