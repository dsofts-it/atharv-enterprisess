import { company } from "../../shared/company";
import { useLanguage } from "./i18n";
import { ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";

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

      <div className="company-verified-card">
        <div className="company-verified-header">
          <div className="company-verified-badge">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span>
              {t([
                "Government Registered & Verified",
                "शासकीय पंजीकृत एवं सत्यापित",
                "शासकीय नोंदणीकृत व पडताळणीकृत",
              ])}
            </span>
          </div>
          <span className="company-verified-validity">
            {t([
              "Status: Permanent (No Renewal Required)",
              "स्थिति: स्थायी (कायमस्वरूपी — नूतनीकरण आवश्यक नाही)",
              "स्थिती: कायमस्वरूपी (नूतनीकरणाची आवश्यकता नाही)",
            ])}
          </span>
        </div>

        <div className="company-reg-highlight">
          <span className="company-reg-label">
            {t([
              "Maharashtra Shops & Establishments Act Reg. No. (नोंदणी क्रमांक)",
              "महाराष्ट्र दुकान एवं स्थापना अधिनियम पंजीकरण क्र. (नोंदणी क्रमांक)",
              "महाराष्ट्र दुकाने व आस्थापना अधिनियम नोंदणी क्रमांक",
            ])}
          </span>
          <span className="company-reg-number">{company.shopActNumber}</span>
          <span className="company-reg-sub">
            {t([
              "Form 'G' Registration Certificate (नमूना 'ग') · Rule 5",
              "नमूना 'ग' पंजीकरण प्रमाणपत्र · नियम 5",
              "नमूना 'ग' नोंदणी प्रमाणपत्र · नियम ५",
            ])}
          </span>
        </div>

        <div className="company-verified-grid">
          <div>
            <strong>
              {t(["Establishment Name", "आस्थापना का नाम", "आस्थापनेचे नाव"])}:
            </strong>{" "}
            ATHARV ENTERPRISES
          </div>
          <div>
            <strong>
              {t(["Nature of Business", "व्यवसाय का स्वरूप", "व्यवसायाचे स्वरूप"])}:
            </strong>{" "}
            {t([
              "Ward Boy and Nurses Bureau Services",
              "वार्ड बॉय और नर्सेस ब्यूरो सेवाएं",
              "वॉर्ड बॉय आणि नर्सेस ब्युरो सर्व्हिसेस",
            ])}
          </div>
          <div>
            <strong>
              {t(["Issuing Authority", "जारीकर्ता प्राधिकरण", "नोंदणी कार्यालय"])}:
            </strong>{" "}
            {t([
              "Office of the Deputy Commissioner of Labour, Pune",
              "उप श्रम आयुक्त कार्यालय, पुणे (महाराष्ट्र शासन)",
              "कामगार उपआयुक्त कार्यालय, पुणे (महाराष्ट्र शासन)",
            ])}
          </div>
          <div>
            <strong>
              {t(["Registration Date", "पंजीकरण दिनांक", "नोंदणी दिनांक"])}:
            </strong>{" "}
            {company.shopActRegistrationDate}
          </div>
        </div>

        <div className="company-verify-action">
          <a
            href={company.shopActVerifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="company-verify-link"
          >
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              {t([
                "Verify authenticity on Aaple Sarkar Govt Portal (aaplesarkar.mahaonline.gov.in)",
                "आपले सरकार शासकीय पोर्टल पर प्रमाणिकता जांचें (aaplesarkar.mahaonline.gov.in)",
                "आपले सरकार शासकीय पोर्टलवर प्रमाणिकता पडताळा (aaplesarkar.mahaonline.gov.in)",
              ])}
            </span>
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
      </div>

      <p>
        <strong>
          {t([
            "Contact & Proprietor",
            "संपर्क एवं प्रोप्राइटर",
            "संपर्क व प्रोप्रायटर",
          ])}
          :{" "}
        </strong>
        {t([
          "Somnath Rajguru (Somnath Pralhad Rajguru)",
          "सोमनाथ राजगुरु (सोमनाथ प्रल्हाद राजगुरु)",
          "सोमनाथ राजगुरु (सोमनाथ प्रल्हाद राजगुरु)",
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
        <strong>{t(["Office Phone", "कार्यालय फोन", "कार्यालयीन फोन"])}: </strong>
        <a href={`tel:+91${company.phones[0]}`}>{company.phones[0]}</a>
        {" · "}
        <strong>{t(["Private Phone", "व्यक्तिगत फोन", "खाजगी फोन"])}: </strong>
        <a href={`tel:+91${company.phones[1]}`}>{company.phones[1]}</a>
      </p>
      <p>
        <strong>{t(["WhatsApp", "व्हाट्सएप", "व्हॉट्सॲप"])}: </strong>
        <a
          href={`https://wa.me/91${company.phones[0]}?text=${encodeURIComponent(
            t([
              "Hello Atharv Enterprises, I would like to enquire about home care services.",
              "नमस्ते अथर्व एंटरप्राइजेज, मुझे घर की देखभाल सेवाओं के बारे में जानकारी चाहिए।",
              "नमस्कार अथर्व एंटरप्रायझेस, मला घरगुती देखभाल सेवांबद्दल माहिती हवी आहे.",
            ]),
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {company.phones[0]} ({t(["Office - 1st Priority", "कार्यालय - मुख्य", "कार्यालय - मुख्य"])})
        </a>
        {" · "}
        <a
          href={`https://wa.me/91${company.phones[1]}?text=${encodeURIComponent(
            t([
              "Hello Atharv Enterprises, I would like to enquire about home care services.",
              "नमस्ते अथर्व एंटरप्राइजेज, मुझे घर की देखभाल सेवाओं के बारे में जानकारी चाहिए।",
              "नमस्कार अथर्व एंटरप्रायझेस, मला घरगुती देखभाल सेवांबद्दल माहिती हवी आहे.",
            ]),
          )}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {company.phones[1]} ({t(["Private", "व्यक्तिगत", "खाजगी"])})
        </a>
      </p>
      {company.emails.map((email) => (
        <p key={email}>
          <a href={`mailto:${email}`}>{email}</a>
        </p>
      ))}
      <p>
        <a href={company.website} target="_blank" rel="noopener noreferrer">
          {company.websiteDisplay}
        </a>
      </p>
      <h3>
        {t(["Office addresses", "कार्यालय के पते", "कार्यालयांचे पत्ते"])}
      </h3>
      <p>
        <strong>{t(["Warje", "वारजे", "वारजे"])}: </strong>
        {t([
          company.offices[0].address,
          "एन. डी. ए. रोड, वारजे मालवाड़ी, संजीवनी अस्पताल के सामने, पुणे — 411052",
          "एन. डी. ए. रोड, वारजे माळवाडी, संजीवनी रुग्णालयासमोर, पुणे — 411052",
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
          "सर्वे नं. 35/2, एम.पो. 1986/2, गोसावी बस्ती, रामनगर, एन. डी. ए. रोड, संजीवनी अस्पताल के सामने, वारजे मालवाड़ी, पुणे 411058, महाराष्ट्र",
          "सर्वे नं. 35/2, एम.पो. 1986/2, गोसावी वस्ती, रामनगर, एन. डी. ए. रोड, संजीवनी रुग्णालयासमोर, वारजे माळवाडी, पुणे 411058, महाराष्ट्र",
        ])}
      </p>
    </section>
  );
}
