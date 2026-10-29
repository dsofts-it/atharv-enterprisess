import { createContext, useContext, useState, type ReactNode } from "react";

export type Language = "en" | "hi" | "mr";
export type Copy = readonly [string, string, string];
const names = { en: "English", hi: "हिन्दी", mr: "मराठी" };
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({ language: "en", setLanguage: () => {} });
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, update] = useState<Language>(() => {
    const saved = localStorage.getItem("atharv-language");
    return saved === "hi" || saved === "mr" ? saved : "en";
  });
  document.documentElement.lang = language;
  const setLanguage = (next: Language) => {
    localStorage.setItem("atharv-language", next);
    update(next);
  };
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  return {
    ...context,
    t: (copy: Copy) => copy[{ en: 0, hi: 1, mr: 2 }[context.language]],
  };
}
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <label className="language-switcher">
      <span className="sr-only">Language / भाषा</span>
      <select
        aria-label="Language / भाषा"
        value={language}
        onChange={(event) => setLanguage(event.target.value as Language)}
      >
        {Object.entries(names).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
export const copy = {
  home: ["Home", "होम", "मुख्यपृष्ठ"],
  services: ["Services", "सेवाएँ", "सेवा"],
  about: ["About us", "हमारे बारे में", "आमच्याबद्दल"],
  process: ["How it works", "प्रक्रिया", "प्रक्रिया"],
  contact: ["Contact", "संपर्क", "संपर्क"],
  portal: ["My care portal", "मेरा केयर पोर्टल", "माझे केअर पोर्टल"],
  enquire: ["Enquire now", "अभी पूछताछ करें", "आता चौकशी करा"],
  details: ["View details", "विवरण देखें", "तपशील पाहा"],
  find: ["Find care", "देखभाल चुनें", "देखभाल निवडा"],
  gallery: ["Gallery", "गैलरी", "छायाचित्रे"],
  all: ["All services", "सभी सेवाएँ", "सर्व सेवा"],
  clinical: ["Clinical care", "चिकित्सकीय देखभाल", "वैद्यकीय देखभाल"],
  everyday: ["Everyday support", "दैनिक सहायता", "दैनंदिन सहाय्य"],
  ai: [
    "AI-generated illustrative photograph. Not a real patient or staff member.",
    "एआई से बना उदाहरणात्मक चित्र। यह वास्तविक मरीज या कर्मचारी नहीं है।",
    "एआयने तयार केलेले प्रातिनिधिक छायाचित्र. हे वास्तविक रुग्ण किंवा कर्मचारी नाहीत.",
  ],
  emergency: [
    "Planned home care, not emergency treatment. In an emergency, seek immediate medical help.",
    "यह नियोजित घरेलू देखभाल है, आपातकालीन उपचार नहीं। आपात स्थिति में तुरंत चिकित्सा सहायता लें।",
    "ही नियोजित घरगुती देखभाल आहे, आपत्कालीन उपचार नाहीत. आपत्कालीन परिस्थितीत तातडीने वैद्यकीय मदत घ्या.",
  ],
  quote: [
    "Care is confirmed after assessment, availability, a quote and an agreement.",
    "आकलन, उपलब्धता, शुल्क प्रस्ताव और सहमति के बाद देखभाल की पुष्टि होती है।",
    "मूल्यांकन, उपलब्धता, शुल्क प्रस्ताव आणि करारानंतर देखभाल निश्चित होते.",
  ],
  noPayment: [
    "No payment is taken with this enquiry.",
    "इस पूछताछ के साथ कोई भुगतान नहीं लिया जाता।",
    "या चौकशीसोबत कोणतेही पैसे घेतले जात नाहीत.",
  ],
} satisfies Record<string, Copy>;
