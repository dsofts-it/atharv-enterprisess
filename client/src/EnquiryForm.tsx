import { tr } from "./legacyTranslations";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { inquirySchema } from "../../shared/schemas";
import { useQuery } from "@tanstack/react-query";
import { api, post } from "./api";
import { useLanguage, copy, type Copy } from "./i18n";
import { serviceContent } from "./serviceContent";
import { CheckCircle2 } from "lucide-react";

type FormData = z.infer<typeof inquirySchema>;
const labels: Record<string, Copy> = {
  name: ["Full name", "पूरा नाम", "पूर्ण नाव"],
  phone: ["Mobile number", "मोबाइल नंबर", "मोबाईल क्रमांक"],
  email: ["Email (optional)", "ईमेल (वैकल्पिक)", "ईमेल (ऐच्छिक)"],
  city: ["City", "शहर", "शहर"],
  locality: ["Area / locality", "क्षेत्र / इलाका", "परिसर / भाग"],
  service: ["Required service", "आवश्यक सेवा", "आवश्यक सेवा"],
  patientAge: [
    "Patient age (optional)",
    "मरीज की उम्र (वैकल्पिक)",
    "रुग्णाचे वय (ऐच्छिक)",
  ],
  startDate: [
    "Preferred start date",
    "पसंदीदा शुरुआत की तारीख",
    "पसंतीची प्रारंभ तारीख",
  ],
  careDuration: ["Care duration", "देखभाल की अवधि", "देखभालीचा कालावधी"],
  preferredShift: ["Preferred shift", "पसंदीदा शिफ्ट", "पसंतीची पाळी"],
  requirements: [
    "Additional requirements (optional)",
    "अन्य आवश्यकताएँ (वैकल्पिक)",
    "अतिरिक्त गरजा (ऐच्छिक)",
  ],
};
export function EnquiryForm() {
  const { t, language } = useLanguage();
  const [params] = useSearchParams();
  const [reference, setReference] = useState("");
  const [failure, setFailure] = useState("");
  const locked = useRef(false);
  const requestId = useRef(crypto.randomUUID());
  const {
    data: services = [],
    isLoading: isCatalogLoading,
    isError: isCatalogError,
  } = useQuery({
    queryKey: ["services"],
    queryFn: () =>
      api<
        {
          slug: string;
          name: string;
          translations?: Record<string, { name: string }>;
        }[]
      >("/services"),
  });
  const form = useForm<FormData>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "Pune",
      locality: params.get("locality") || "",
      service: params.get("service") || "General inquiry",
      careDuration: "daily",
      preferredShift: "Flexible",
      requirements: "",
      website: "",
    },
  });
  const preselected = params.get("service");
  const appliedService = useRef<string | null>(null);
  const setValue = form.setValue;
  useEffect(() => {
    if (
      preselected &&
      appliedService.current !== preselected &&
      services.some((service) => service.slug === preselected)
    ) {
      setValue("service", preselected);
      appliedService.current = preselected;
    }
  }, [preselected, services, setValue]);
  const submit = form.handleSubmit(async (values) => {
    if (locked.current) return;
    if (!values.startDate) {
      form.setError("startDate", { message: "Choose a start date" });
      return;
    }
    locked.current = true;
    setFailure("");
    try {
      const result = await post("/public/inquiries", {
        ...values,
        language,
        requestId: requestId.current,
      });
      setReference(result.reference);
    } catch (error) {
      setFailure((error as Error).message);
    } finally {
      locked.current = false;
    }
  });
  const field = (name: keyof FormData, input: React.ReactNode) => {
    const error = form.formState.errors[name];
    return (
      <div className="field">
        <label htmlFor={`enquiry-${name}`}>{t(labels[name])}</label>
        {input}
        {error && (
          <small className="field-error" id={`error-${name}`} role="alert">
            {t(
              name === "phone"
                ? [
                    "Enter a valid Indian mobile number (10 digits, starting 6–9).",
                    "मान्य भारतीय मोबाइल नंबर दर्ज करें (10 अंक, शुरुआत 6–9)।",
                    "वैध भारतीय मोबाईल क्रमांक लिहा (१० अंक, सुरुवात ६–९).",
                  ]
                : [
                    "Please check this field.",
                    "कृपया यह जानकारी जाँचें।",
                    "कृपया ही माहिती तपासा.",
                  ],
            )}
          </small>
        )}
      </div>
    );
  };
  const props = (name: keyof FormData) => ({
    id: `enquiry-${name}`,
    "aria-invalid": !!form.formState.errors[name],
    "aria-describedby": form.formState.errors[name]
      ? `error-${name}`
      : undefined,
  });
  if (reference)
    return (
      <div className="paper hc-enquiry-success" role="status">
        <CheckCircle2 size={44} />
        <h2>
          {t([
            "Your enquiry is saved.",
            "आपकी पूछताछ सुरक्षित हो गई है।",
            "आपली चौकशी नोंदवली आहे.",
          ])}
        </h2>
        <p>
          {t(["Reference", "संदर्भ क्रमांक", "संदर्भ क्रमांक"])}:{" "}
          <strong>{reference}</strong>
        </p>
        <p>
          {t([
            "The team will review your request. A booking is confirmed only after assessment, availability, quote and agreement.",
            "टीम आपके अनुरोध की समीक्षा करेगी। आकलन, उपलब्धता, शुल्क और सहमति के बाद ही बुकिंग की पुष्टि होगी।",
            "संघ आपल्या विनंतीचे पुनरावलोकन करेल. मूल्यांकन, उपलब्धता, शुल्क आणि करारानंतरच बुकिंग निश्चित होईल.",
          ])}
        </p>
        <Link className="button" to="/how-it-works">
          {t(copy.process)}
        </Link>
        <button
          className="button secondary"
          onClick={() => {
            setReference("");
            form.reset();
            requestId.current = crypto.randomUUID();
          }}
        >
          {t([
            "Send another enquiry",
            "एक और पूछताछ भेजें",
            "आणखी चौकशी पाठवा",
          ])}
        </button>
      </div>
    );
  return (
    <form className="paper hc-enquiry-form" onSubmit={submit} noValidate>
      <h2>
        {t(["Enquire about care", "देखभाल की पूछताछ", "देखभालीची चौकशी"])}
      </h2>
      <p>{t(copy.noPayment)}</p>
      <div className="form-grid">
        {field(
          "name",
          <input
            {...props("name")}
            {...form.register("name")}
            autoComplete="name"
            maxLength={100}
          />,
        )}
        {field(
          "phone",
          <input
            {...props("phone")}
            {...form.register("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="9876543210"
          />,
        )}
        {field(
          "email",
          <input
            {...props("email")}
            {...form.register("email")}
            type="email"
            autoComplete="email"
          />,
        )}
        {field(
          "city",
          <input
            {...props("city")}
            {...form.register("city")}
            autoComplete="address-level2"
            maxLength={80}
          />,
        )}
        {field(
          "locality",
          <input
            {...props("locality")}
            {...form.register("locality")}
            autoComplete="address-level3"
            maxLength={100}
          />,
        )}
        {field(
          "service",
          <select
            {...props("service")}
            {...form.register("service")}
            disabled={isCatalogLoading}
          >
            <option value="General inquiry">
              {t([
                "Help me choose / general enquiry",
                "चुनने में मदद / सामान्य पूछताछ",
                "निवडण्यास मदत / सामान्य चौकशी",
              ])}
            </option>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {serviceContent[s.slug]
                  ? t(serviceContent[s.slug].name)
                  : s.name}
              </option>
            ))}
          </select>,
        )}
        {field(
          "patientAge",
          <input
            {...props("patientAge")}
            {...form.register("patientAge", {
              setValueAs: (value) => (value === "" ? undefined : Number(value)),
            })}
            type="number"
            min={0}
            max={120}
          />,
        )}
        {field(
          "startDate",
          <input
            {...props("startDate")}
            {...form.register("startDate", {
              setValueAs: (value) => value || undefined,
            })}
            type="date"
            min={new Date().toLocaleDateString("en-CA")}
          />,
        )}
        {field(
          "careDuration",
          <select {...props("careDuration")} {...form.register("careDuration")}>
            {(
              [
                [
                  "visit",
                  ["One-time visit", "एक बार की मुलाकात", "एक वेळची भेट"],
                ],
                ["daily", ["Daily care", "दैनिक देखभाल", "दैनंदिन देखभाल"]],
                [
                  "weekly",
                  ["Weekly care", "साप्ताहिक देखभाल", "साप्ताहिक देखभाल"],
                ],
                ["monthly", ["Monthly care", "मासिक देखभाल", "मासिक देखभाल"]],
                [
                  "long-term",
                  [
                    "Long-term care",
                    "लंबी अवधि की देखभाल",
                    "दीर्घकालीन देखभाल",
                  ],
                ],
              ] as [string, Copy][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </select>,
        )}
        {field(
          "preferredShift",
          <select
            {...props("preferredShift")}
            {...form.register("preferredShift")}
          >
            {(
              [
                [
                  "Flexible",
                  [
                    "Flexible / discuss with team",
                    "लचीला / टीम से चर्चा करें",
                    "लवचिक / संघाशी चर्चा करा",
                  ],
                ],
                ["Day", ["Day shift", "दिन की शिफ्ट", "दिवसाची पाळी"]],
                ["Night", ["Night shift", "रात की शिफ्ट", "रात्रीची पाळी"]],
                [
                  "12-hour",
                  ["12-hour shift", "12 घंटे की शिफ्ट", "१२ तासांची पाळी"],
                ],
                [
                  "24-hour coverage",
                  [
                    "24-hour coverage (multiple shifts)",
                    "24 घंटे की देखभाल (अलग शिफ्ट)",
                    "२४ तास देखभाल (वेगवेगळ्या पाळ्या)",
                  ],
                ],
              ] as [string, Copy][]
            ).map(([value, label]) => (
              <option key={value} value={value}>
                {t(label)}
              </option>
            ))}
          </select>,
        )}
      </div>
      {isCatalogError && (
        <p role="alert">
          {t([
            "The service list is unavailable. You can still send a general enquiry.",
            "सेवाओं की सूची उपलब्ध नहीं है। आप सामान्य पूछताछ भेज सकते हैं।",
            "सेवांची यादी उपलब्ध नाही. आपण सामान्य चौकशी पाठवू शकता.",
          ])}
        </p>
      )}
      {field(
        "requirements",
        <textarea
          {...props("requirements")}
          {...form.register("requirements")}
          maxLength={1000}
          rows={3}
        />,
      )}
      <p className="hc-form-note">
        {t([
          "Do not include medical records, identity numbers or confidential health details. All scheduling requests are subject to assessment and availability.",
          "चिकित्सा रिकॉर्ड, पहचान संख्या या गोपनीय स्वास्थ्य जानकारी न दें। सभी शिफ्ट अनुरोध आकलन और उपलब्धता पर निर्भर हैं।",
          "वैद्यकीय नोंदी, ओळख क्रमांक किंवा गोपनीय आरोग्य माहिती देऊ नका. सर्व वेळापत्रक विनंत्या मूल्यांकन आणि उपलब्धतेवर अवलंबून आहेत.",
        ])}
      </p>
      <div className="hc-honeypot" aria-hidden="true">
        <label>
          Website
          <input
            {...form.register("website")}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>
      <label className="checkbox">
        <input type="checkbox" {...form.register("consent")} />
        <span>
          {t([
            "I agree to be contacted about this enquiry and have read the",
            "मैं इस पूछताछ के बारे में संपर्क किए जाने के लिए सहमत हूँ और मैंने पढ़ी है",
            "या चौकशीबद्दल संपर्क साधण्यास मी संमती देतो/देते आणि मी वाचली आहे",
          ])}{" "}
          <Link to="/privacy-policy">
            {t(["privacy notice", "गोपनीयता सूचना", "गोपनीयता सूचना"])}
          </Link>
          .
        </span>
      </label>
      {form.formState.errors.consent && (
        <p role="alert" className="field-error">
          {t([
            "Please confirm your consent.",
            "कृपया अपनी सहमति दें।",
            "कृपया आपली संमती द्या.",
          ])}
        </p>
      )}
      {failure && (
        <div className="notice error" role="alert">
          {tr(failure)}
        </div>
      )}
      <button className="button full" disabled={form.formState.isSubmitting}>
        {t(
          form.formState.isSubmitting
            ? ["Sending…", "भेज रहे हैं…", "पाठवत आहोत…"]
            : ["Send enquiry", "पूछताछ भेजें", "चौकशी पाठवा"],
        )}
      </button>
    </form>
  );
}
