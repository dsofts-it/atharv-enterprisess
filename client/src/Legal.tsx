import { useLanguage } from "./i18n";
import { legalTranslations } from "./legalTranslations";
import { useParams, Link } from "react-router-dom";
import { PageIntro } from "./components";
import { company } from "../../shared/company";
import { ShieldCheck } from "lucide-react";
const content: Record<string, { title: string; sections: [string, string][] }> =
  {
    "privacy-policy": {
      title: "Your information, handled with care.",
      sections: [
        [
          "Scope and purpose",
          "Atharv Enterprises processes information to respond to inquiries, assess care needs, coordinate bookings and staff, manage agreements and billing, and resolve service concerns. This draft covers the website and care portal.",
        ],
        [
          "What we collect",
          "Contact information, minimum necessary care requirements, scheduling preferences, account details, agreement acknowledgments and relevant service records. Do not submit full medical records, Aadhaar numbers or identity documents through general inquiry forms.",
        ],
        [
          "Who can access information",
          "Access is restricted by role and service relationship. Caregivers access assigned work; families access their own permitted records. Finance staff access billing rather than unrestricted health information. Providers used for hosting or email require appropriate contractual and security review.",
        ],
        [
          "Your choices and requests",
          "Use Support → Privacy in your portal to request access, correction, withdrawal, deletion or account closure. The team must review identity, legal retention and service implications before processing a request. Withdrawal does not automatically erase legally retained financial or audit records.",
        ],
        [
          "Retention and safeguards",
          "Records must be retained only for approved purposes and required periods. Production deployment requires a documented retention schedule, grievance contact, breach procedure, access review and backup controls. Cookies support authenticated sessions; health data is not stored in browser local storage.",
        ],
        [
          "Before production",
          "Business contact and grievance details, processor terms, statutory commencement dates and retention periods must be confirmed by the business and Indian legal counsel. This page is a draft, not a certification of compliance.",
        ],
      ],
    },
    terms: {
      title: "Clear expectations, from the start.",
      sections: [
        [
          "Using this website",
          "Public content describes available categories of care. Availability and suitability are subject to assessment and confirmation. Website information is not a diagnosis, treatment recommendation or emergency response.",
        ],
        [
          "Accounts and responsibilities",
          "Keep credentials private. Provide accurate, necessary information and submit care requests only when authorized. Do not access other users’ records or misuse confidential information.",
        ],
        [
          "Service relationship",
          "The company coordinates confirmed care. Clinical work requires appropriately qualified professionals and clinician direction. Non-clinical attendants do not independently perform nursing procedures.",
        ],
        [
          "Questions and disputes",
          "Use the contact form or authenticated support portal. Concerns require fair human review and any applicable legal remedies remain available. These draft terms require Indian legal review before use.",
        ],
      ],
    },
    "booking-terms": {
      title: "Your care request, explained.",
      sections: [
        [
          "A request is a starting point",
          "Submitting a request does not confirm a caregiver, price or start time. The team reviews needs and availability before preparing a quote.",
        ],
        [
          "Confirmation and agreement",
          "Care requires an accepted, versioned service agreement, approved quote and billing arrangement. Review inclusions, exclusions, schedules, cancellation terms and emergency contacts before acceptance.",
        ],
        [
          "Changes and transfers",
          "Request extensions, replacements and staff transfer arrangements through the portal. No automatic penalty or unreviewed transfer fee applies. Safety and lawful emergency communication must remain possible.",
        ],
        [
          "Electronic acknowledgment",
          "Portal acceptance records identity, time, document version and hash. An ordinary click acknowledgment is not presented as a qualified electronic signature. Legal review is required.",
        ],
      ],
    },
    "cancellation-policy": {
      title: "When plans change, let’s talk.",
      sections: [
        [
          "Requesting a cancellation",
          "Submit a Cancellation support request linked to your booking. The team reviews the service status and safe handover needs. Submitting a request is not an instant status change.",
        ],
        [
          "Charges and refunds",
          "Any charge or refund must follow the accepted quote and legally reviewed terms. No arbitrary fee is configured. Refunds require owner review and a recorded reason.",
        ],
        [
          "Replacement and continuity",
          "If a caregiver arrangement is unsuitable, request a replacement. Do not wait for a portal reply when urgent medical attention is required.",
        ],
        [
          "Draft policy",
          "Notice periods, refund processing timelines and applicable charges must be approved and published before commercial use.",
        ],
      ],
    },
    "caregiver-standards": {
      title: "Respect. Suitability. Accountability.",
      sections: [
        [
          "Appropriate roles",
          "Nursing tasks require suitable qualifications and current credentials. Attendants provide non-clinical assistance within their competence.",
        ],
        [
          "Onboarding",
          "The company reviews caregiver profiles, service eligibility, locality, credentials where relevant, engagement type and agreement acceptance before approval. Approval must reflect real verification, not an automatic website claim.",
        ],
        [
          "Safe schedules",
          "Assignments check overlapping shifts, configured working-hour limits and rest periods. Extended coverage requires a suitable staffing arrangement rather than one continuous 24-hour worker.",
        ],
        [
          "Professional conduct",
          "Respect privacy, consent, dignity and safe communication. Record attendance accurately and raise incidents through the company. Report concerns without invasive monitoring or automatic assumptions of wrongdoing.",
        ],
      ],
    },
    complaints: {
      title: "Your concerns deserve to be heard.",
      sections: [
        [
          "Tell us what happened",
          "Sign in and open Support → Complaint to submit a private concern. For a general question, use the contact form without including health information.",
        ],
        [
          "A fair review",
          "The team records concerns, reviews relevant information and provides a resolution through your portal. A warning signal is not proof of wrongdoing and does not trigger an automatic penalty.",
        ],
        [
          "Urgent situations",
          "For immediate medical danger, contact emergency services directly. The website is not continuously monitored for emergencies.",
        ],
        [
          "Grievance process",
          "The business must configure its verified grievance contact and legally appropriate response timelines before production.",
        ],
      ],
    },
    accessibility: {
      title: "Care should feel accessible.",
      sections: [
        [
          "Our approach",
          "The interface uses readable text, labeled forms, keyboard focus indicators, semantic navigation and reduced-motion support. Responsive layouts support phones, tablets and desktops.",
        ],
        [
          "Getting help",
          "If a page or care request is difficult to use, send a general inquiry through Contact. Include the page and the issue, without confidential records.",
        ],
        [
          "Ongoing verification",
          "WCAG 2.2 AA is the target. Automated checks do not replace assistive-technology testing or feedback from people using the service. Any unverified accessibility claim remains a deployment review item.",
        ],
      ],
    },
  };
export default function Legal({ page }: { page?: string }) {
  const { language, t } = useLanguage();
  const params = useParams();
  const key = page || params.page || "";
  const data =
    language === "en"
      ? content[key]
      : legalTranslations[key]?.[language] || content[key];
  if (!data) return null;
  return (
    <>
      <PageIntro
        eyebrow={t([
          "INFORMATION & RESPONSIBILITIES",
          "जानकारी और जिम्मेदारियाँ",
          "माहिती आणि जबाबदाऱ्या",
        ])}
        title={data.title}
      />
      <article className="container narrow legal">
        <div className="notice">
          {t([
            "Draft for business and Indian legal review before production use.",
            "वास्तविक उपयोग से पहले व्यवसाय और भारतीय कानूनी समीक्षा के लिए मसौदा।",
            "प्रत्यक्ष वापरापूर्वी व्यवसाय आणि भारतीय कायदेशीर पुनरावलोकनासाठी मसुदा.",
          ])}
        </div>
        {data.sections.map(([title, text]) => (
          <section key={title}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        <section className="legal-statutory-card">
          <div className="legal-statutory-badge">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>
              {t([
                "Statutory Business Entity Details",
                "सांविधिक व्यावसायिक इकाई विवरण",
                "वैधानिक व्यवसाय अस्तित्व तपशील",
              ])}
            </span>
          </div>
          <p>
            <strong>
              {t(["Legal Name", "कानूनी नाम", "नोंदणीकृत नाव"])}:
            </strong>{" "}
            {company.name} ({company.bureau})
          </p>
          <p>
            <strong>
              {t([
                "Maharashtra Shops & Establishments Act Reg. No.",
                "महाराष्ट्र दुकान एवं स्थापना अधिनियम पंजीकरण संख्या",
                "महाराष्ट्र दुकाने व आस्थापना अधिनियम नोंदणी क्रमांक",
              ])}
              :
            </strong>{" "}
            <code className="legal-reg-code">{company.shopActNumber}</code>{" "}
            <span className="legal-verified-pill">
              ✓ {t(["Permanent / Verified", "स्थायी / सत्यापित", "कायमस्वरूपी / पडताळणीकृत"])}
            </span>
          </p>
          <p>
            <strong>
              {t(["Issuing Authority", "जारीकर्ता प्राधिकरण", "नोंदणी कार्यालय"])}:
            </strong>{" "}
            {t([
              company.shopActAuthority,
              "उप श्रम आयुक्त कार्यालय, पुणे (महाराष्ट्र शासन)",
              "कामगार उपआयुक्त कार्यालय, पुणे (महाराष्ट्र शासन)",
            ])}
          </p>
          <p>
            <strong>
              {t(["Udyam Registration", "उद्यम पंजीकरण", "उद्यम नोंदणी"])}:
            </strong>{" "}
            <code>{company.udyamNumber}</code>
          </p>
          <p>
            <strong>
              {t(["Proprietor", "मालिक", "मालक"])}:
            </strong>{" "}
            {company.proprietor}
          </p>
        </section>
        <Link className="text-link" to="/contact">
          {t([
            "Contact the care team",
            "देखभाल टीम से संपर्क करें",
            "देखभाल संघाशी संपर्क करा",
          ])}
        </Link>
      </article>
    </>
  );
}
export const legalPaths = Object.keys(content);
