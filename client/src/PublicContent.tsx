import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api, apiUrl } from "./api";
import { useLanguage, copy } from "./i18n";
export function usePublicContent() {
  return useQuery({
    queryKey: ["public-content"],
    queryFn: () => api<any[]>("/public/content"),
    staleTime: 60000,
  });
}
export function PublicBlocks({ kind }: { kind: string }) {
  const { language, t } = useLanguage();
  const { data = [] } = usePublicContent();
  const rows = data.filter((row) => row.kind === kind);
  if (!rows.length) return null;
  return (
    <div className="hc-content-blocks">
      {rows.map((row) => (
        <article key={row._id} className="paper" id={row.slug}>
          {row.imageId && (
            <figure className="care-photo">
              <img
                loading="lazy"
                src={apiUrl(`/public/media/${row.imageId._id}`)}
                alt={row.imageId.alt[language]}
                width={900}
                height={600}
              />
              <figcaption>
                {row.imageId.illustrative
                  ? t(copy.ai)
                  : t([
                      "Business photograph published with permission.",
                      "अनुमति से प्रकाशित व्यवसाय का चित्र।",
                      "परवानगीने प्रकाशित केलेले व्यवसायाचे छायाचित्र.",
                    ])}
              </figcaption>
            </figure>
          )}
          <h2>{row.title[language]}</h2>
          <p style={{ whiteSpace: "pre-line" }}>{row.body[language]}</p>
          {row.externalUrl && (
            <a href={row.externalUrl} target="_blank" rel="noopener noreferrer">
              {t([
                "Open verified link",
                "सत्यापित लिंक खोलें",
                "पडताळलेला दुवा उघडा",
              ])}
            </a>
          )}
        </article>
      ))}
    </div>
  );
}
export function ResourcesPage() {
  const { t } = useLanguage();
  return (
    <section className="container hc-section">
      <p className="eyebrow">
        {t([
          "FAMILY GUIDES",
          "परिवार के लिए मार्गदर्शन",
          "कुटुंबासाठी मार्गदर्शन",
        ])}
      </p>
      <h1>
        {t([
          "Prepare for your care conversation.",
          "देखभाल की बातचीत के लिए तैयार हों।",
          "देखभालीच्या संवादासाठी तयारी करा.",
        ])}
      </h1>
      <div className="hc-benefits">
        {[
          [
            [
              "Before sending an enquiry",
              "पूछताछ भेजने से पहले",
              "चौकशी पाठवण्यापूर्वी",
            ],
            [
              "Note the type of assistance, locality, preferred start date and coverage hours. Share only the minimum details needed; keep medical records and identity documents out of public enquiries.",
              "सहायता का प्रकार, क्षेत्र, शुरुआत की तारीख और समय लिख लें। केवल जरूरी जानकारी दें; सार्वजनिक पूछताछ में चिकित्सा रिकॉर्ड और पहचान दस्तावेज न भेजें।",
              "सहाय्याचा प्रकार, परिसर, प्रारंभ तारीख आणि वेळ नोंदवा. आवश्यक माहितीच द्या; सार्वजनिक चौकशीत वैद्यकीय नोंदी आणि ओळखपत्रे पाठवू नका.",
            ],
          ],
          [
            ["Nurse or attendant?", "नर्स या सहायक?", "नर्स की सहाय्यक?"],
            [
              "Describe whether the need is clinician-directed nursing or everyday assistance. The care team reviews the appropriate role and scope before arranging a service.",
              "बताएँ कि जरूरत चिकित्सक के निर्देशानुसार नर्सिंग की है या दैनिक सहायता की। सेवा तय करने से पहले टीम उपयुक्त भूमिका और दायरे की समीक्षा करती है।",
              "डॉक्टरांच्या सूचनांनुसार नर्सिंग हवी आहे की दैनंदिन मदत ते सांगा. सेवा ठरवण्यापूर्वी संघ योग्य भूमिका आणि कार्यकक्षा तपासतो.",
            ],
          ],
          [
            [
              "Before confirming care",
              "देखभाल की पुष्टि से पहले",
              "देखभाल निश्चित करण्यापूर्वी",
            ],
            [
              "Read the scope, proposed schedule, charges, agreement and cancellation terms. Ask the team about anything unclear before accepting. Use the portal for private follow-up.",
              "स्वीकार करने से पहले सेवा का दायरा, समय, शुल्क, सहमति और रद्द करने की शर्तें पढ़ें। अस्पष्ट बातों पर टीम से पूछें। निजी बातचीत के लिए पोर्टल का उपयोग करें।",
              "स्वीकारण्यापूर्वी सेवेची व्याप्ती, वेळापत्रक, शुल्क, करार आणि रद्द करण्याच्या अटी वाचा. अस्पष्ट गोष्टी संघाला विचारा. खाजगी पाठपुराव्यासाठी पोर्टल वापरा.",
            ],
          ],
        ].map(([heading, body], i) => (
          <article key={i}>
            <h2>{t(heading as [string, string, string])}</h2>
            <p>{t(body as [string, string, string])}</p>
          </article>
        ))}
      </div>
      <PublicBlocks kind="blog" />
      <PublicBlocks kind="video" />
      <Link className="button" to="/enquire">
        {t(copy.enquire)}
      </Link>
    </section>
  );
}
