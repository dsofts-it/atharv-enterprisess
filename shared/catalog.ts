export const services = [
  {
    slug: "home-nursing",
    name: "Home nursing",
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
    icon: "heart",
  },
  {
    slug: "elderly-care",
    name: "Elderly care",
    tag: "EVERYDAY WELLBEING",
    summary: "A little help with daily life. A lot of peace of mind.",
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
  },
  {
    slug: "patient-attendant",
    name: "Patient attendants",
    tag: "A HELPING HAND",
    summary: "Thoughtful, practical assistance when it matters most.",
    description:
      "Non-clinical support for patients at home or in hospital, with care coordinated through our team.",
    includes: [
      "Hygiene and comfort assistance",
      "Meal and mobility support",
      "Family handover",
    ],
    excludes: ["Nursing procedures", "Emergency medical care"],
    clinical: false,
    icon: "hand",
  },
  {
    slug: "post-operative-care",
    name: "Post-operative assistance",
    tag: "RECOVERY AT HOME",
    summary: "Support for the next step in your recovery journey.",
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
  },
];
export const faqs = [
  [
    "How do I arrange care for a loved one?",
    "Start with a care request. Our team reviews your needs, discusses a suitable plan and quote, and coordinates staff only after the required agreements and confirmation.",
  ],
  [
    "What is the difference between a nurse and an attendant?",
    "Qualified nurses may perform authorized clinical tasks. Attendants help with everyday personal care, comfort and mobility; they do not independently perform nursing procedures.",
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
