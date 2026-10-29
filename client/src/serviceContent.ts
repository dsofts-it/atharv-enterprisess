import type { Copy } from "./i18n";
export const serviceContent: Record<
  string,
  {
    name: Copy;
    summary: Copy;
    audience: Copy;
    highlights: Copy[];
    image: string;
  }
> = {
  "home-nursing": {
    name: ["Home nursing", "घर पर नर्सिंग", "घरगुती नर्सिंग"],
    summary: [
      "Nursing support at home, coordinated around your treating clinician’s instructions.",
      "उपचार करने वाले चिकित्सक के निर्देशों के अनुसार घर पर नर्सिंग सहायता।",
      "उपचार करणाऱ्या डॉक्टरांच्या सूचनांनुसार घरी नर्सिंग सहाय्य.",
    ],
    audience: [
      "Families seeking clinician-directed nursing support at home.",
      "घर पर चिकित्सक के निर्देशों के अनुसार नर्सिंग चाहने वाले परिवार।",
      "डॉक्टरांच्या सूचनांनुसार घरी नर्सिंग हवी असलेली कुटुंबे.",
    ],
    highlights: [
      [
        "Clinician-directed care",
        "चिकित्सक के निर्देशानुसार देखभाल",
        "डॉक्टरांच्या सूचनांनुसार देखभाल",
      ],
      [
        "Care observations and family handover",
        "देखभाल की जानकारी और परिवार से समन्वय",
        "देखभालीच्या नोंदी आणि कुटुंबाशी समन्वय",
      ],
    ],
    image: "home-nursing",
  },
  "elderly-care": {
    name: ["Elderly care", "बुज़ुर्गों की देखभाल", "ज्येष्ठांची देखभाल"],
    summary: [
      "Respectful companionship and everyday assistance in familiar surroundings.",
      "परिचित घर में सम्मानपूर्ण साथ और दैनिक कार्यों में सहायता।",
      "ओळखीच्या घरात आदरपूर्वक सोबत आणि दैनंदिन कामांत मदत.",
    ],
    audience: [
      "Older adults needing help with daily routines and companionship.",
      "दैनिक कार्यों और साथ की आवश्यकता वाले बुज़ुर्ग।",
      "दैनंदिन कामांत मदत आणि सोबत हवी असलेले ज्येष्ठ.",
    ],
    highlights: [
      [
        "Personal care and companionship",
        "व्यक्तिगत देखभाल और साथ",
        "वैयक्तिक देखभाल आणि सोबत",
      ],
      [
        "Mobility and daily routines",
        "चलने-फिरने और दिनचर्या में सहायता",
        "हालचाल आणि दिनचर्येत मदत",
      ],
    ],
    image: "elderly-care",
  },
  "patient-attendant": {
    name: ["Patient caretaker", "मरीज की देखभाल", "रुग्ण सहाय्यक"],
    summary: [
      "Practical, non-clinical assistance with comfort, meals and daily activities.",
      "आराम, भोजन और दैनिक गतिविधियों में गैर-चिकित्सकीय सहायता।",
      "आराम, जेवण आणि दैनंदिन कामांसाठी गैर-वैद्यकीय सहाय्य.",
    ],
    audience: [
      "Patients who need everyday assistance at home or in hospital.",
      "घर या अस्पताल में दैनिक सहायता चाहने वाले मरीज।",
      "घरी किंवा रुग्णालयात दैनंदिन मदत हवी असलेले रुग्ण.",
    ],
    highlights: [
      ["Hygiene and comfort", "स्वच्छता और आराम", "स्वच्छता आणि आराम"],
      [
        "Meal and mobility assistance",
        "भोजन और चलने-फिरने में मदद",
        "जेवण आणि हालचालीत मदत",
      ],
    ],
    image: "patient-attendant",
  },
  "post-operative-care": {
    name: [
      "Post-operative support",
      "ऑपरेशन के बाद सहायता",
      "शस्त्रक्रियेनंतर सहाय्य",
    ],
    summary: [
      "Help with everyday activities after discharge, guided by the recovery plan.",
      "अस्पताल से छुट्टी के बाद रिकवरी योजना के अनुसार दैनिक कामों में सहायता।",
      "रुग्णालयातून घरी आल्यावर पुनर्प्राप्ती योजनेनुसार दैनंदिन कामांत मदत.",
    ],
    audience: [
      "People returning home after surgery who need everyday support.",
      "ऑपरेशन के बाद घर लौटे लोग जिन्हें दैनिक सहायता चाहिए।",
      "शस्त्रक्रियेनंतर घरी आलेले आणि रोजच्या कामांत मदत हवी असलेले रुग्ण.",
    ],
    highlights: [
      [
        "Discharge-plan coordination",
        "अस्पताल की छुट्टी योजना से समन्वय",
        "डिस्चार्ज योजनेशी समन्वय",
      ],
      [
        "Comfort and daily activity support",
        "आराम और दैनिक कार्यों में मदद",
        "आराम आणि रोजच्या कामांत मदत",
      ],
    ],
    image: "post-operative-care",
  },
  "24-hour-care": {
    name: [
      "Day & night care",
      "दिन और रात की देखभाल",
      "दिवस आणि रात्रीची देखभाल",
    ],
    summary: [
      "Continuity of everyday support through coordinated caregiver shifts.",
      "समन्वित देखभालकर्ता शिफ्टों के माध्यम से लगातार दैनिक सहायता।",
      "समन्वित सहाय्यकांच्या पाळ्यांमधून सातत्यपूर्ण दैनंदिन मदत.",
    ],
    audience: [
      "Families needing extended coverage, subject to staff availability.",
      "कर्मचारी उपलब्धता के अनुसार लंबी अवधि की सहायता चाहने वाले परिवार।",
      "कर्मचारी उपलब्धतेनुसार दीर्घकाळ सहाय्य हवे असलेली कुटुंबे.",
    ],
    highlights: [
      [
        "Planned multi-person shifts",
        "नियोजित अलग-अलग कर्मचारियों की शिफ्ट",
        "नियोजित अनेक कर्मचाऱ्यांच्या पाळ्या",
      ],
      [
        "Clear handovers and family updates",
        "स्पष्ट हैंडओवर और परिवार को जानकारी",
        "स्पष्ट हस्तांतरण आणि कुटुंबाला माहिती",
      ],
    ],
    image: "day-night-care",
  },
  "bedridden-care": {
    name: [
      "Bedridden patient care",
      "बिस्तर पर रहने वाले मरीज की देखभाल",
      "अंथरुणाला खिळलेल्या रुग्णांची देखभाल",
    ],
    summary: [
      "Gentle personal assistance built around comfort, dignity and daily needs.",
      "आराम, गरिमा और दैनिक जरूरतों पर केंद्रित संवेदनशील व्यक्तिगत सहायता।",
      "आराम, सन्मान आणि दैनंदिन गरजांवर आधारित संवेदनशील वैयक्तिक मदत.",
    ],
    audience: [
      "People with limited mobility who need bedside assistance.",
      "सीमित गतिशीलता वाले लोग जिन्हें बिस्तर पर सहायता चाहिए।",
      "मर्यादित हालचाल असलेले आणि अंथरुणावर सहाय्य हवे असलेले रुग्ण.",
    ],
    highlights: [
      [
        "Personal hygiene support",
        "व्यक्तिगत स्वच्छता में सहायता",
        "वैयक्तिक स्वच्छतेसाठी मदत",
      ],
      [
        "Clinician-advised positioning assistance",
        "चिकित्सक की सलाह से स्थिति बदलने में सहायता",
        "डॉक्टरांच्या सल्ल्यानुसार स्थिती बदलण्यास मदत",
      ],
    ],
    image: "bedridden-care",
  },
};
