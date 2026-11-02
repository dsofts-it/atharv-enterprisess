import { company } from "../../shared/company";
import type { Copy } from "./i18n";

export const careAgreement: Copy = [
  "For clients and nursing/care professionals: clients must not privately engage a professional introduced or assigned by Atharv Enterprises, and professionals must not solicit or accept private work from company-introduced clients, during the assignment or afterwards, without the company’s prior written approval. Arrange services, renewals and payments through the company. This is company policy, subject to the signed service/employment agreement and applicable law.",
  "ग्राहकों और नर्सिंग/देखभाल कर्मियों के लिए: अथर्व एंटरप्राइजेज द्वारा परिचित या नियुक्त कर्मी को ग्राहक कंपनी की पूर्व लिखित अनुमति के बिना निजी तौर पर नियुक्त न करें। कर्मी भी कंपनी द्वारा परिचित ग्राहकों से निजी काम न माँगें और न स्वीकार करें—नियुक्ति के दौरान या बाद में। सेवाएँ, नवीनीकरण और भुगतान कंपनी के माध्यम से करें। यह कंपनी की नीति है और हस्ताक्षरित सेवा/रोजगार अनुबंध तथा लागू कानून के अधीन है।",
  "ग्राहक आणि नर्सिंग/देखभाल कर्मचाऱ्यांसाठी: अथर्व एंटरप्रायझेसने ओळख करून दिलेल्या किंवा नियुक्त केलेल्या कर्मचाऱ्याला कंपनीच्या पूर्व लेखी परवानगीशिवाय ग्राहकांनी खाजगी कामावर ठेवू नये. कर्मचाऱ्यांनीही कंपनीने ओळख करून दिलेल्या ग्राहकांकडे खाजगी काम मागू किंवा स्वीकारू नये—नियुक्तीदरम्यान किंवा नंतर. सेवा, नूतनीकरण आणि देयके कंपनीमार्फत करा. हे कंपनीचे धोरण असून स्वाक्षरी केलेल्या सेवा/रोजगार करार आणि लागू कायद्याच्या अधीन आहे.",
];

export function enquiryWhatsAppUrl(message: string) {
  return `https://wa.me/91${company.contacts.office}?text=${encodeURIComponent(message)}`;
}
