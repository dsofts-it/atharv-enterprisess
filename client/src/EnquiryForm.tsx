import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "./i18n";
import { careAgreement, enquiryWhatsAppUrl } from "./enquiryWhatsApp";

export function EnquiryForm({ careers = false }: { careers?: boolean }) {
  const { t, language } = useLanguage();
  const [params] = useSearchParams();
  const role = careers ? "professional" : "client";
  const [draft, setDraft] = useState("");
  const roleLabel =
    role === "client"
      ? t(["Client / family", "ग्राहक / परिवार", "ग्राहक / कुटुंब"])
      : t([
          "Nursing / care professional",
          "नर्सिंग / देखभाल कर्मी",
          "नर्सिंग / देखभाल कर्मचारी",
        ]);
  return (
    <form
      className="paper hc-enquiry-form"
      onChange={() => setDraft("")}
      onSubmit={(event) => {
        event.preventDefault();
        if (!event.currentTarget.reportValidity()) return;
        const data = new FormData(event.currentTarget);
        const message = [
          t([
            "ATHARV ENTERPRISES — ENQUIRY & ACKNOWLEDGEMENT",
            "अथर्व एंटरप्राइजेज — पूछताछ और सहमति",
            "अथर्व एंटरप्रायझेस — चौकशी आणि संमती",
          ]),
          `${t(["Date / time (IST)", "दिनांक / समय (IST)", "दिनांक / वेळ (IST)"])}: ${new Date().toLocaleString(language === "en" ? "en-IN" : language === "hi" ? "hi-IN" : "mr-IN", { timeZone: "Asia/Kolkata", dateStyle: "long", timeStyle: "short" })}`,
          `${t(["Enquiry from", "पूछताछ करने वाला", "चौकशी करणारे"])}: ${roleLabel}`,
          `${t(["Full name", "पूरा नाम", "पूर्ण नाव"])}: ${String(data.get("name")).trim()}`,
          `${t(["Mobile", "मोबाइल", "मोबाईल"])}: ${data.get("phone")}`,
          ...(careers
            ? []
            : [
                `${t(["Patient name", "मरीज का नाम", "रुग्णाचे नाव"])}: ${String(data.get("patientName")).trim()}`,
              ]),
          ...(careers
            ? [`Experience: ${String(data.get("details")).trim()}`]
            : []),
          "",
          careAgreement[{ en: 0, hi: 1, mr: 2 }[language]],
          "",
          t([
            "I agree to the policy above and to being contacted about this enquiry.",
            "मैं उपरोक्त नीति और इस पूछताछ के बारे में संपर्क किए जाने के लिए सहमत हूँ।",
            "वरील धोरण आणि या चौकशीबद्दल संपर्क साधण्यास मी सहमती देतो/देते.",
          ]),
          `${t(["Acknowledged by", "सहमति देने वाले का नाम", "संमती देणाऱ्याचे नाव"])}: ${String(data.get("name")).trim()}`,
        ].join("\n");
        const url = enquiryWhatsAppUrl(message);
        setDraft(url);
        window.open(url, "_blank", "noopener,noreferrer");
      }}
    >
      <h2>
        {t([
          "Enquire on WhatsApp",
          "व्हाट्सएप पर पूछताछ करें",
          "व्हॉट्सॲपवर चौकशी करा",
        ])}
      </h2>
      <p>
        {t([
          "Fill in your details, agree, and open WhatsApp. Tap Send there to finish.",
          "ग्राहकों, परिवारों और नर्सिंग / देखभाल कर्मियों के लिए। जानकारी कंपनी के व्हाट्सएप 8803602030 पर जाएगी। पूछताछ पूरी करने के लिए व्हाट्सएप में भेजें दबाएँ।",
          "ग्राहक, कुटुंबे आणि नर्सिंग / देखभाल कर्मचाऱ्यांसाठी. माहिती कंपनीच्या व्हॉट्सॲप 8803602030 वर जाईल. चौकशी पूर्ण करण्यासाठी व्हॉट्सॲपमध्ये पाठवा दाबा.",
        ])}
      </p>
      <div className="form-grid">
        <label>
          {t(["Full name", "पूरा नाम", "पूर्ण नाव"])}
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            pattern=".*\S.*"
          />
        </label>
        <label>
          {t(["Mobile number", "मोबाइल नंबर", "मोबाईल क्रमांक"])}
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            pattern="(?:\+91)?[6-9][0-9]{9}"
            placeholder="8803602030"
          />
        </label>
        {!careers && (
          <label>
            {t(["Patient name", "मरीज का नाम", "रुग्णाचे नाव"])}
            <input
              name="patientName"
              required
              minLength={2}
              maxLength={100}
              pattern=".*\S.*"
            />
          </label>
        )}
      </div>
      {careers && (
        <label>
          {t([
            "Experience and availability",
            "अनुभव और उपलब्धता",
            "अनुभव आणि उपलब्धता",
          ])}
          <textarea
            name="details"
            rows={3}
            required
            maxLength={1000}
            defaultValue={params.get("service") || ""}
          />
        </label>
      )}
      <p className="hc-form-note">
        {t([
          "Please do not include medical records, identity numbers or confidential health information.",
          "कृपया चिकित्सा रिकॉर्ड, पहचान संख्या या गोपनीय स्वास्थ्य जानकारी न दें।",
          "कृपया वैद्यकीय नोंदी, ओळख क्रमांक किंवा गोपनीय आरोग्य माहिती देऊ नका.",
        ])}
      </p>
      <details className="hc-enquiry-policy">
        <summary>
          {t([
            "Client & care professional policy",
            "ग्राहक और देखभाल कर्मी नीति",
            "ग्राहक व देखभाल कर्मचारी धोरण",
          ])}
        </summary>
        <p>{t(careAgreement)}</p>
      </details>
      <label className="checkbox">
        <input name="agreement" type="checkbox" required />
        <span>
          {t([
            "I agree to the policy and to being contacted about this enquiry.",
            "मैं उपरोक्त नीति से सहमत हूँ, अपने नाम की पुष्टि करता/करती हूँ और इस पूछताछ के बारे में संपर्क की सहमति देता/देती हूँ।",
            "वरील धोरणाशी मी सहमत आहे, माझ्या नावाची पुष्टी करतो/करते आणि या चौकशीबद्दल संपर्कासाठी संमती देतो/देते.",
          ])}{" "}
          <Link to="/privacy-policy">
            {t(["Privacy notice", "गोपनीयता सूचना", "गोपनीयता सूचना"])}
          </Link>
        </span>
      </label>
      <button className="button full" type="submit">
        {t([
          "Submit on WhatsApp",
          "मैं सहमत हूँ — व्हाट्सएप खोलें",
          "मी सहमत आहे — व्हॉट्सॲप उघडा",
        ])}
      </button>
      {draft && (
        <p role="status">
          {t([
            "Your message is ready. It is sent only when you tap Send in WhatsApp.",
            "आपका संदेश तैयार है। व्हाट्सएप में भेजें दबाने पर ही वह भेजा जाएगा।",
            "आपला संदेश तयार आहे. व्हॉट्सॲपमध्ये पाठवा दाबल्यावरच तो पाठवला जाईल.",
          ])}{" "}
          <a href={draft} target="_blank" rel="noopener noreferrer">
            {t([
              "Open WhatsApp again",
              "व्हाट्सएप फिर खोलें",
              "व्हॉट्सॲप पुन्हा उघडा",
            ])}
          </a>
        </p>
      )}
    </form>
  );
}
