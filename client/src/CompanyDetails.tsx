import { company } from "../../shared/company";
import { useLanguage } from "./i18n";

export function CompanyDetails() {
  const { t } = useLanguage();
  return (
    <section className="paper company-details">
      <h2>{t(["Company details", "कंपनी की जानकारी", "कंपनीची माहिती"])}</h2>
      <h3>
        {t([
          "Atharv Enterprises · Nurses Bureau Service",
          "अथर्व एंटरप्राइजेज · नर्सेस ब्यूरो सर्विस",
          "अथर्व एंटरप्रायझेस · नर्सेस ब्यूरो सर्व्हिसेस",
        ])}
      </h3>
      <p>
        {t([
          "Contact: Somnath Rajguru",
          "संपर्क: सोमनाथ राजगुरु",
          "संपर्क: सोमनाथ राजगुरु",
        ])}
      </p>
      <p>
        <strong>
          {t([
            "Udyam registration number",
            "उद्यम पंजीकरण संख्या",
            "उद्यम नोंदणी क्रमांक",
          ])}
          :{" "}
        </strong>
        {company.udyamNumber}
      </p>
      <p>
        {t([
          "Micro enterprise · Services · Registered on 30 July 2026",
          "सूक्ष्म उद्यम · सेवाएँ · पंजीकरण: 30 जुलाई 2026",
          "सूक्ष्म उद्योग · सेवा · नोंदणी: ३० जुलै २०२६",
        ])}
      </p>
      <p>
        {company.phones.map((phone, i) => (
          <span key={phone}>
            {i > 0 && " / "}
            <a href={`tel:+91${phone}`}>{phone}</a>
          </span>
        ))}
      </p>
      {company.emails.map((email) => (
        <p key={email}>
          <a href={`mailto:${email}`}>{email}</a>
        </p>
      ))}
      <p>
        <a href={company.website}>www.atharventerprise.in</a>
      </p>
      <h3>
        {t(["Office addresses", "कार्यालय के पते", "कार्यालयांचे पत्ते"])}
      </h3>
      <p>
        <strong>{t(["Warje", "वारजे", "वारजे"])}: </strong>
        {t([
          company.offices[0].address,
          "वारजे मालवाड़ी, संजीवनी अस्पताल के सामने, पुणे — 411052",
          "वारजे माळवाडी, संजीवनी रुग्णालयासमोर, पुणे — 411052",
        ])}
      </p>
      <p>
        <strong>{t(["Pimpri", "पिंपरी", "पिंपरी"])}: </strong>
        {t([
          company.offices[1].address,
          "डी. वाई. पाटिल कॉलेज एवं अस्पताल, संत तुकाराम नगर, पिंपरी — 411018",
          "डी. वाय. पाटील कॉलेज व रुग्णालय, संत तुकाराम नगर, पिंपरी — 411018",
        ])}
      </p>
      <h3>
        {t([
          "Registered address (Udyam)",
          "पंजीकृत पता (उद्यम)",
          "नोंदणीकृत पत्ता (उद्यम)",
        ])}
      </h3>
      <p>
        {t([
          company.registeredAddress,
          "सर्वे नं. 35/2, एम.पो. 1986/2, गोसावी बस्ती, रामनगर, एनडीए रोड, संजीवनी अस्पताल के पास, वारजे, पुणे 411058, महाराष्ट्र",
          "सर्वे नं. 35/2, एम.पो. 1986/2, गोसावी वस्ती, रामनगर, एनडीए रोड, संजीवनी रुग्णालयाजवळ, वारजे, पुणे 411058, महाराष्ट्र",
        ])}
      </p>
    </section>
  );
}
