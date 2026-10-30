export const services = [
  {
    slug: "home-nursing",
    name: "Home nursing care",
    tag: "CLINICAL CARE",
    summary: "Skilled nursing support in the comfort and familiarity of home.",
    description:
      "Care coordinated around your clinician’s instructions, delivered by appropriately qualified nursing professionals.",
    includes: [
      "Clinician-directed nursing tasks",
      "Care observations and handover",
      "Family coordination",
    ],
    excludes: ["Emergency treatment", "Independent diagnosis or prescribing"],
    clinical: true,
    requiredQualification: "nurse",
    icon: "heart",
    image: "home-nursing",
    sortOrder: 1,
    featured: true,
    translations: {
      hi: {
        name: "घर पर नर्सिंग सेवा",
        summary:
          "उपचार करने वाले चिकित्सक के निर्देशों के अनुसार घर पर नर्सिंग सहायता।",
        description:
          "योग्य नर्सिंग पेशेवर आपके चिकित्सक के निर्देशों के अनुसार घर पर देखभाल करते हैं।",
      },
      mr: {
        name: "घरच्या घरी नर्सिंग सेवा",
        summary: "उपचार करणाऱ्या डॉक्टरांच्या सूचनांनुसार घरी नर्सिंग सहाय्य.",
        description:
          "पात्र नर्सिंग व्यावसायिक डॉक्टरांच्या सूचनांनुसार घरी देखभाल करतात.",
      },
    },
  },
  {
    slug: "injection-dressing",
    name: "Injection & dressing",
    tag: "CLINICAL CARE",
    summary:
      "Injections and wound dressing at home, only as advised by your doctor.",
    description:
      "Qualified nursing staff can assist with injections and dressing when your treating clinician has given clear directions. We do not decide medicines or dosages independently.",
    includes: [
      "Doctor-directed injections",
      "Wound dressing as advised",
      "Family handover after the visit",
    ],
    excludes: ["Emergency treatment", "Independent diagnosis or prescribing"],
    clinical: true,
    requiredQualification: "nurse",
    icon: "syringe",
    image: "injection-dressing",
    sortOrder: 2,
    featured: true,
    translations: {
      hi: {
        name: "इंजेक्शन और ड्रेसिंग",
        summary: "डॉक्टर की सलाह के अनुसार घर पर इंजेक्शन और घाव की ड्रेसिंग।",
        description:
          "योग्य नर्सिंग कर्मचारी चिकित्सक के स्पष्ट निर्देश होने पर इंजेक्शन और ड्रेसिंग में सहायता कर सकते हैं। दवा या खुराक का स्वतंत्र निर्णय नहीं लिया जाता।",
      },
      mr: {
        name: "इंजेक्शन व ड्रेसिंग",
        summary: "डॉक्टरांच्या सल्ल्यानुसार घरी इंजेक्शन आणि जखमेची ड्रेसिंग.",
        description:
          "डॉक्टरांच्या स्पष्ट सूचना असल्यास पात्र नर्सिंग कर्मचारी इंजेक्शन आणि ड्रेसिंगमध्ये मदत करू शकतात. औषध किंवा मात्रा स्वतंत्रपणे ठरवली जात नाही.",
      },
    },
  },
  {
    slug: "post-operative-care",
    name: "Post-operative care",
    tag: "RECOVERY AT HOME",
    summary: "Support for the next step in your recovery after surgery.",
    description:
      "Help with everyday activities after discharge, with nursing tasks arranged separately when clinically indicated.",
    includes: [
      "Daily activity assistance",
      "Discharge-plan coordination",
      "Comfort and mobility support",
    ],
    excludes: ["Treatment decisions", "Unprescribed procedures"],
    clinical: false,
    icon: "activity",
    image: "post-operative-care",
    sortOrder: 3,
    featured: true,
    translations: {
      hi: {
        name: "ऑपरेशन के बाद की देखभाल",
        summary:
          "अस्पताल से छुट्टी के बाद रिकवरी योजना के अनुसार दैनिक कामों में सहायता।",
        description:
          "डिस्चार्ज के बाद रोजमर्रा की गतिविधियों में मदद। चिकित्सकीय नर्सिंग कार्य अलग से योग्य पेशेवर द्वारा किए जाते हैं।",
      },
      mr: {
        name: "शस्त्रक्रियेनंतरची काळजी",
        summary:
          "रुग्णालयातून घरी आल्यावर पुनर्प्राप्ती योजनेनुसार दैनंदिन कामांत मदत.",
        description:
          "डिस्चार्जनंतर रोजच्या कामांत मदत. वैद्यकीय नर्सिंग कामे स्वतंत्र पात्र व्यावसायिकांकडून होतात.",
      },
    },
  },
  {
    slug: "elderly-care",
    name: "Elderly care",
    tag: "EVERYDAY WELLBEING",
    summary: "Respectful companionship and everyday help for older adults.",
    description:
      "Respectful companionship and everyday assistance that supports independence and familiar routines.",
    includes: [
      "Personal care and daily routines",
      "Mobility assistance",
      "Companionship",
    ],
    excludes: ["Clinical procedures", "Independent medication administration"],
    clinical: false,
    icon: "sun",
    image: "elderly-care",
    sortOrder: 4,
    featured: true,
    translations: {
      hi: {
        name: "बुज़ुर्गों की देखभाल",
        summary: "परिचित घर में सम्मानपूर्ण साथ और दैनिक कार्यों में सहायता।",
        description:
          "स्वतंत्रता और परिचित दिनचर्या बनाए रखने में आदरपूर्वक साथ और रोजमर्रा की मदद।",
      },
      mr: {
        name: "ज्येष्ठ नागरिकांची देखभाल",
        summary: "ओळखीच्या घरात आदरपूर्वक सोबत आणि दैनंदिन कामांत मदत.",
        description:
          "स्वावलंबन आणि परिचित दिनचर्या टिकवण्यासाठी आदरपूर्वक सोबत आणि रोजची मदत.",
      },
    },
  },
  {
    slug: "bedridden-care",
    name: "Bedridden patient care",
    tag: "COMFORT & DIGNITY",
    summary: "Gentle assistance built around comfort and dignity.",
    description:
      "Personal care and everyday support for people with limited mobility. Clinical needs are assessed separately.",
    includes: [
      "Personal hygiene support",
      "Clinician-advised positioning assistance",
      "Daily care coordination",
    ],
    excludes: ["Unqualified clinical procedures", "Independent treatment"],
    clinical: false,
    icon: "bed",
    image: "bedridden-care",
    sortOrder: 5,
    featured: true,
    translations: {
      hi: {
        name: "बिस्तर पर रहने वाले मरीज की देखभाल",
        summary:
          "आराम, गरिमा और दैनिक जरूरतों पर केंद्रित संवेदनशील व्यक्तिगत सहायता।",
        description:
          "सीमित गतिशीलता वाले लोगों के लिए व्यक्तिगत देखभाल। चिकित्सकीय जरूरतें अलग से आँकी जाती हैं।",
      },
      mr: {
        name: "अंथरुणाला खिळलेल्या रुग्णांची काळजी",
        summary:
          "आराम, सन्मान आणि दैनंदिन गरजांवर आधारित संवेदनशील वैयक्तिक मदत.",
        description:
          "मर्यादित हालचाल असलेल्या व्यक्तींसाठी वैयक्तिक देखभाल. वैद्यकीय गरजा स्वतंत्रपणे तपासल्या जातात.",
      },
    },
  },
  {
    slug: "vital-signs-monitoring",
    name: "Vital signs monitoring",
    tag: "CLINICAL CARE",
    summary:
      "Home checks of blood pressure, temperature, pulse and related observations.",
    description:
      "Nursing staff can record blood pressure, temperature, pulse and similar observations and share them with the family and treating clinician. This is planned monitoring, not emergency response.",
    includes: [
      "Blood pressure, pulse and temperature checks",
      "Simple observation notes for the family",
      "Handover to the treating clinician’s plan",
    ],
    excludes: ["Emergency treatment", "Independent diagnosis"],
    clinical: true,
    requiredQualification: "nurse",
    icon: "activity",
    image: "vital-signs-monitoring",
    sortOrder: 6,
    featured: true,
    translations: {
      hi: {
        name: "जीवन संकेतों की जाँच",
        summary: "घर पर रक्तचाप, तापमान, नाड़ी और संबंधित जाँच।",
        description:
          "नर्सिंग कर्मचारी रक्तचाप, तापमान, नाड़ी जैसी जाँच दर्ज कर परिवार और चिकित्सक के साथ साझा कर सकते हैं। यह नियोजित निगरानी है, आपातकालीन उपचार नहीं।",
      },
      mr: {
        name: "जीवनचिन्ह तपासणी",
        summary: "घरी रक्तदाब, तापमान, नाडी आणि संबंधित तपासणी.",
        description:
          "नर्सिंग कर्मचारी रक्तदाब, तापमान, नाडी यांची नोंद करून कुटुंब आणि डॉक्टरांसोबत शेअर करू शकतात. ही नियोजित तपासणी आहे, आपत्कालीन उपचार नाहीत.",
      },
    },
  },
  {
    slug: "medication-assistance",
    name: "Medication assistance",
    tag: "CLINICAL CARE",
    summary: "Help taking prescribed medicines on time, as directed.",
    description:
      "Support to remember and take medicines that a treating clinician has already prescribed. Staff do not change doses or prescribe new medicines.",
    includes: [
      "Reminders for prescribed doses",
      "Help taking medicines as directed",
      "Family updates about the schedule",
    ],
    excludes: ["Prescribing or changing doses", "Emergency treatment"],
    clinical: true,
    requiredQualification: "nurse",
    icon: "heart",
    image: "medication-assistance",
    sortOrder: 7,
    featured: true,
    translations: {
      hi: {
        name: "दवा लेने में सहायता",
        summary:
          "निर्धारित दवा समय पर लेने में मदद, चिकित्सक के निर्देशानुसार।",
        description:
          "चिकित्सक द्वारा पहले से लिखी दवा याद रखने और लेने में सहायता। कर्मचारी खुराक नहीं बदलते और नई दवा नहीं लिखते।",
      },
      mr: {
        name: "औषधे घेण्यासाठी मदत",
        summary: "डॉक्टरांनी सांगितलेली औषधे वेळेवर घेण्यासाठी मदत.",
        description:
          "डॉक्टरांनी आधी लिहिलेली औषधे आठवण करून देणे आणि घेण्यात मदत. कर्मचारी मात्रा बदलत नाहीत किंवा नवीन औषध लिहित नाहीत.",
      },
    },
  },
  {
    slug: "wound-care",
    name: "Wound care",
    tag: "CLINICAL CARE",
    summary: "Dressing and wound support at home, following clinical advice.",
    description:
      "Nursing support for wound dressing and related care when your treating clinician has given directions. We do not treat injuries independently or replace hospital care.",
    includes: [
      "Clinician-directed dressing changes",
      "Observation notes for the family",
      "Hygiene around the wound as advised",
    ],
    excludes: ["Independent wound surgery", "Emergency trauma care"],
    clinical: true,
    requiredQualification: "nurse",
    icon: "heart",
    image: "wound-care",
    sortOrder: 8,
    featured: true,
    translations: {
      hi: {
        name: "घाव की देखभाल",
        summary: "चिकित्सक की सलाह के अनुसार घर पर घाव की ड्रेसिंग और देखभाल।",
        description:
          "चिकित्सक के निर्देश होने पर घाव की ड्रेसिंग में नर्सिंग सहायता। स्वतंत्र शल्य चिकित्सा या आपातकालीन आघात उपचार शामिल नहीं है।",
      },
      mr: {
        name: "जखमेची काळजी",
        summary: "डॉक्टरांच्या सल्ल्यानुसार घरी जखमेची ड्रेसिंग आणि काळजी.",
        description:
          "डॉक्टरांच्या सूचना असल्यास जखमेच्या ड्रेसिंगसाठी नर्सिंग मदत. स्वतंत्र शस्त्रक्रिया किंवा आपत्कालीन आघात उपचार समाविष्ट नाहीत.",
      },
    },
  },
  {
    slug: "physiotherapy-support",
    name: "Physiotherapy support",
    tag: "THERAPY AT HOME",
    summary: "Home physiotherapy support arranged around a therapist’s advice.",
    description:
      "Assistance with mobility and exercises recommended by a physiotherapist or treating clinician. Availability of a physiotherapist is confirmed after assessment.",
    includes: [
      "Therapist-advised home exercises",
      "Mobility and comfort support",
      "Family guidance on the plan",
    ],
    excludes: ["Independent diagnosis", "Emergency treatment"],
    clinical: true,
    requiredQualification: "physiotherapist",
    icon: "activity",
    image: "physiotherapy",
    sortOrder: 9,
    featured: true,
    translations: {
      hi: {
        name: "फिजियोथेरेपी सहायता",
        summary: "थेरेपिस्ट की सलाह के अनुसार घर पर फिजियोथेरेपी सहयोग।",
        description:
          "फिजियोथेरेपिस्ट या चिकित्सक द्वारा सुझाए गए व्यायाम और गतिशीलता में सहायता। फिजियोथेरेपिस्ट की उपलब्धता आकलन के बाद पुष्टि होती है।",
      },
      mr: {
        name: "फिजिओथेरपी सहाय्य",
        summary: "तज्ज्ञांच्या सल्ल्यानुसार घरी फिजिओथेरपी सेवा.",
        description:
          "फिजिओथेरपिस्ट किंवा डॉक्टरांनी सुचवलेल्या व्यायाम आणि हालचालीत मदत. फिजिओथेरपिस्टची उपलब्धता मूल्यांकनानंतर निश्चित होते.",
      },
    },
  },
  {
    slug: "mother-baby-care",
    name: "Mother & baby care",
    tag: "FAMILY SUPPORT",
    summary: "Everyday support for mothers and newborn babies at home.",
    description:
      "Practical help with newborn routines, feeding support as advised, and rest for the mother. Clinical decisions remain with the treating clinician.",
    includes: [
      "Newborn hygiene and routine support",
      "Mother rest and household help around baby care",
      "Guidance aligned with clinician advice",
    ],
    excludes: ["Independent medical treatment", "Emergency maternity care"],
    clinical: false,
    icon: "heart",
    image: "mother-newborn-care",
    sortOrder: 10,
    featured: true,
    translations: {
      hi: {
        name: "माँ और शिशु की देखभाल",
        summary: "घर पर माँ और नवजात शिशु के लिए दैनिक सहायता।",
        description:
          "नवजात की दिनचर्या, सलाह के अनुसार दूध/आहार में मदद और माँ के आराम में व्यावहारिक सहयोग। चिकित्सकीय निर्णय चिकित्सक के पास रहते हैं।",
      },
      mr: {
        name: "आई व बाळाची देखभाल",
        summary: "घरी आई आणि नवजात बाळासाठी दैनंदिन मदत.",
        description:
          "नवजाताच्या दिनचर्येत मदत, सल्ल्यानुसार आहार आणि आईच्या विश्रांतीसाठी व्यावहारिक सहाय्य. वैद्यकीय निर्णय डॉक्टरांकडे राहतात.",
      },
    },
  },
  {
    slug: "patient-attendant",
    name: "Patient attendants",
    tag: "A HELPING HAND",
    summary:
      "Ward boy, maushi and attendant support for comfort and daily needs.",
    description:
      "Non-clinical support for patients at home or in hospital, including ward boy, maushi and attendant help, coordinated through our team.",
    includes: [
      "Hygiene and comfort assistance",
      "Meal and mobility support",
      "Family handover",
    ],
    excludes: ["Nursing procedures", "Emergency medical care"],
    clinical: false,
    icon: "hand",
    image: "patient-attendant",
    sortOrder: 11,
    featured: false,
    translations: {
      hi: {
        name: "वार्ड बॉय, मौसी और परिचारक",
        summary: "आराम, भोजन और दैनिक गतिविधियों में गैर-चिकित्सकीय सहायता।",
        description:
          "घर या अस्पताल में वार्ड बॉय, मौसी और परिचारक द्वारा व्यावहारिक मदद। नर्सिंग प्रक्रियाएँ शामिल नहीं हैं।",
      },
      mr: {
        name: "वॉर्ड बॉय, मावशी आणि आया",
        summary: "आराम, जेवण आणि दैनंदिन कामांसाठी गैर-वैद्यकीय सहाय्य.",
        description:
          "घरी किंवा रुग्णालयात वॉर्ड बॉय, मावशी आणि आया यांची व्यावहारिक मदत. नर्सिंग प्रक्रिया समाविष्ट नाहीत.",
      },
    },
  },
  {
    slug: "24-hour-care",
    name: "Day & night care",
    tag: "CONTINUITY OF CARE",
    summary: "Coordinated support through the day and into the night.",
    description:
      "Day, night and extended coverage arranged through suitable multi-person shifts, subject to assessment and staff availability.",
    includes: [
      "Planned caregiver handovers",
      "Coordinated shift coverage",
      "Family updates",
    ],
    excludes: [
      "One person working continuously for 24 hours",
      "Emergency response",
    ],
    clinical: false,
    icon: "moon",
    image: "day-night-care",
    sortOrder: 12,
    featured: false,
    translations: {
      hi: {
        name: "दिन और रात की देखभाल",
        summary:
          "समन्वित देखभालकर्ता शिफ्टों के माध्यम से लगातार दैनिक सहायता।",
        description:
          "दिन, रात और विस्तारित सेवा अलग-अलग उपयुक्त शिफ्टों में होती है; एक व्यक्ति लगातार 24 घंटे काम नहीं करता। उपलब्धता आकलन के बाद पुष्टि होती है।",
      },
      mr: {
        name: "दिवस आणि रात्रीची देखभाल",
        summary: "समन्वित सहाय्यकांच्या पाळ्यांमधून सातत्यपूर्ण दैनंदिन मदत.",
        description:
          "दिवस, रात्र आणि विस्तारित सेवा अनेक योग्य पाळ्यांमधून; एकच व्यक्ती सलग २४ तास काम करत नाही. उपलब्धता मूल्यांकनानंतर निश्चित होते.",
      },
    },
  },
];
export const faqs = [
  [
    "How do I arrange care for a loved one?",
    "Start with a care request. Our team reviews your needs, discusses a suitable plan and quote, and coordinates staff only after the required agreements and confirmation.",
  ],
  [
    "What is the difference between a nurse and an attendant?",
    "Qualified nurses may perform authorized clinical tasks. Attendants, ward boys and maushi help with everyday personal care, comfort and mobility; they do not independently perform nursing procedures.",
  ],
  [
    "Can I request day, night or extended care?",
    "Yes. Tell us the coverage you need. Extended care is coordinated across suitable shifts and caregivers, subject to availability.",
  ],
  [
    "How much does home care cost?",
    "Pricing depends on your needs, shift duration, location and staff qualifications. You receive a quote before confirming care.",
  ],
  [
    "Can I request a different caregiver?",
    "Yes. Submit a replacement request through your portal so the team can review your needs and coordinate a safe handover.",
  ],
  [
    "Is this an emergency service?",
    "No. For a medical emergency, contact local emergency services or go to the nearest emergency department. Do not wait for a website response.",
  ],
];
export const areas = [
  "Warje",
  "Baner",
  "Aundh",
  "Wakad",
  "Hinjawadi",
  "Kothrud",
  "Shivajinagar",
  "Viman Nagar",
  "Hadapsar",
  "Pimpri-Chinchwad",
];
export const agreementText =
  "Atharv Enterprises coordinates care subject to assessment, availability, an approved quote and the agreed service scope. Qualified nursing and non-clinical assistance have different responsibilities. Request changes, renewals, cancellations or staff transfers through the company so continuity, consent and billing can be reviewed. Protect confidential information. No automatic penalties or restrictions on emergency assistance apply. Complaints and disputed charges receive human review. This development agreement is a draft requiring Indian legal review before production use. Acceptance records an ordinary electronic acknowledgment, not a qualified digital signature.";
