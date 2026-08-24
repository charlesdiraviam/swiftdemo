// Mock data for the SWIFT Emergency & Urgent Care demo.
// All content is placeholder/demo data based on the current public website.

window.SWIFT_DATA = {
  clinic: {
    name: "SWIFT Emergency & Urgent Care",
    tagline: "Emergency? Think SWIFT.",
    phone: "(02) 8859 9099",
    phoneAlt: "1300 ESWIFT",
    email: "info@swifteuc.com.au",
    address: "G38, 32 Civic Way, Rouse Hill, NSW 2155",
    hours: "Open every day, 10:00am – 10:00pm (last registration 9:00pm)",
    facilityFee: "$396 facility fee + Medicare charges (reimbursed with a valid Medicare card).",
    heroImage: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=1600&q=80&auto=format&fit=crop",
    heroAlt: "Calm, modern urgent-care clinic reception (representative photo)",
  },

  services: [
    {
      icon: "stethoscope",
      name: "Sports Injury",
      cost: "From $396 facility fee",
      summary:
        "Ankle, wrist, knee or back injuries managed by trained Emergency Physicians for a swift recovery.",
      treatments: ["Sprains & strains", "Joint injuries", "On-site imaging"],
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80&auto=format&fit=crop",
      imageAlt: "Therapist supporting a patient's ankle during rehabilitation",
    },
    {
      icon: "bone",
      name: "Fracture Clinic",
      cost: "From $396 facility fee",
      summary:
        "Fractures followed up with specialist Orthopaedic surgeons within 24 hours.",
      treatments: ["Casting & splinting", "Ortho referral < 24h", "Follow-up review"],
      image: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80&auto=format&fit=crop",
      imageAlt: "Clinical X-ray films being reviewed on a light box",
    },
    {
      icon: "baby",
      name: "Paediatrics",
      cost: "From $396 facility fee",
      summary:
        "In-house paediatricians for quick treatment when children fall sick or are injured (age > 3 months).",
      treatments: ["Child-friendly care", "Fever & infections", "Minor injuries"],
      image: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80&auto=format&fit=crop",
      imageAlt: "Paediatrician examining a young child in a friendly clinic room",
    },
    {
      icon: "syringe",
      name: "Infusion Clinic",
      cost: "From $396 facility fee",
      summary:
        "Iron infusions completed in under an hour instead of long ED waits. Book an appointment.",
      treatments: ["Iron infusion", "Planned therapy", "By appointment"],
      image: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&q=80&auto=format&fit=crop",
      imageAlt: "Comfortable modern infusion suite with recliner chair",
    },
    {
      icon: "scan",
      name: "Interventional Radiology",
      cost: "From $396 facility fee",
      summary:
        "Back, shoulder or joint pain tended to quickly with seasoned radiologists on hand.",
      treatments: ["Image-guided care", "Pain management", "Rapid imaging"],
      image: "https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?w=800&q=80&auto=format&fit=crop",
      imageAlt: "Radiology scan monitor displaying medical imaging",
    },
    {
      icon: "activity",
      name: "Physiotherapy",
      cost: "From $396 facility fee",
      summary:
        "Highly trained physiotherapists for fast recovery and a quick return to daily activity.",
      treatments: ["Post-procedure rehab", "Movement recovery", "Injury prevention"],
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop",
      imageAlt: "Physiotherapist guiding a patient through recovery exercises",
    },
  ],

  doctors: [
    {
      name: "Dr Vijay Manivel",
      role: "Co-Founder & Director",
      specialty: "Emergency Medicine",
      initials: "VM",
      bio: "Emergency Physician trained in acute care, leading SWIFT's clinical vision.",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=600&q=80&auto=format&fit=crop",
      imageAlt: "Representative photo of an emergency physician in scrubs",
    },
    {
      name: "Dr Gopinath Betarayappa",
      role: "Co-Founder & Director",
      specialty: "Emergency Medicine",
      initials: "GB",
      bio: "Emergency Physician focused on efficient, patient-centred urgent care.",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80&auto=format&fit=crop",
      imageAlt: "Representative photo of an emergency physician consulting a patient",
    },
    {
      name: "Dr Stephen Madden",
      role: "Senior Emergency Doctor",
      specialty: "Acute Care",
      initials: "SM",
      bio: "Senior Emergency Doctor experienced in minor injuries and non-life-threatening illness.",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600&q=80&auto=format&fit=crop",
      imageAlt: "Representative photo of a senior doctor reviewing notes",
    },
  ],

  // Mock "NSW Health" nearby hospital ED wait times (fake data for demo).
  waitTimes: {
    swiftCurrentMins: 12,
    hospitals: [
      { name: "Rouse Hill (SWIFT Urgent Care)", mins: 12, distanceKm: 0 },
      { name: "Blacktown Hospital ED", mins: 168, distanceKm: 12.4 },
      { name: "Norwest Private Hospital ED", mins: 95, distanceKm: 6.1 },
      { name: "Westmead Hospital ED", mins: 210, distanceKm: 18.7 },
    ],
  },

  promotions: [
    {
      id: "flu",
      title: "Winter Flu & Fever Care",
      badge: "Seasonal",
      body: "Walk in for rapid assessment of flu-like symptoms — no appointment needed.",
      image: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=800&q=80&auto=format&fit=crop",
      imageAlt: "Thermometer and warm drink suggesting seasonal flu care",
    },
    {
      id: "infusion",
      title: "Iron Infusion Clinic",
      badge: "By appointment",
      body: "Skip the long ED wait — iron infusions in under an hour. Book online.",
      image: "https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=800&q=80&auto=format&fit=crop",
      imageAlt: "Calm private infusion suite with modern equipment",
    },
  ],

  // Scripted chatbot responses (fake AI) for the demo.
  chatScript: [
    { q: /wait|time|busy/i, a: "Our current urgent care wait is about 12 minutes. Nearby hospital EDs are 1.5–3.5 hours." },
    { q: /cost|price|fee|pay/i, a: "It's a $396 facility fee plus Medicare charges. Medicare charges are fully reimbursed with a valid Medicare card." },
    { q: /open|hour|time.*open/i, a: "We're open every day, 10:00am–10:00pm. Last patient registration is 9:00pm." },
    { q: /book|appointment|appt/i, a: "For planned therapies like iron infusions, tap 'Book Now'. For minor emergencies, just walk in!" },
    { q: /where|location|address|direction/i, a: "We're at G38, 32 Civic Way, Rouse Hill NSW 2155. Tap 'Directions' for Google Maps." },
    { q: /treat|service|offer|child|kid|paediatric/i, a: "We treat sports injuries, fractures, paediatrics (>3mo), infusions, radiology and physiotherapy." },
    { q: /triage|should i come|what.*wrong/i, a: "Try our 'Can we treat this?' checker above — 3 quick questions will tell you whether to walk in, book, or call 000." },
    { q: /results|test|x-?ray|scan/i, a: "Demo test results are available via the 'Test & imaging results' section — sign in with demo/demo." },
    { q: /queue|wait list|reserve/i, a: "Use Online Check-in to reserve your spot — you'll see your queue number and an estimated wait." },
  ],

  // Social-media campaign landing variants (§6)
  campaigns: {
    default: {
      id: "default",
      name: "Default",
      eyebrow: "Emergency Physician led · Walk-in",
      headlineHTML: 'Emergency? <span class="text-teal-200">Think SWIFT.</span>',
      subtext: "Best-practice urgent care in a calm, modern environment. Minor emergencies — no appointment needed, just walk in.",
      primaryCta: { label: "Request Appointment", action: "openBooking" },
      secondaryCta: { label: "Check Wait Times", href: "#wait" },
      highlightService: null,
      ribbonText: null,
      stickyCta: { label: "Book Now", action: "openBooking" },
    },
    flu: {
      id: "flu",
      name: "Flu & Fever",
      eyebrow: "Walk-in · No appointment",
      headlineHTML: 'Flu or fever? <span class="text-teal-200">Walk in today.</span>',
      subtext: "Rapid assessment of flu-like symptoms by Emergency Physicians. Skip the hospital ED — open 10am to 10pm daily.",
      primaryCta: { label: "Check current wait", href: "#wait" },
      secondaryCta: { label: "Get directions", href: "#location" },
      highlightService: "Paediatrics",
      ribbonText: "You're viewing our Flu & Fever info",
      stickyCta: { label: "Check wait now", href: "#wait" },
      services: ["Paediatrics", "Sports Injury", "Infusion Clinic", "Fracture Clinic", "Interventional Radiology", "Physiotherapy"],
      intentsOrder: ["now", "imaging", "infusion"],
      bookingService: "Paediatrics",
      hideSections: [],
    },
    sports: {
      id: "sports",
      name: "Sports Injury",
      eyebrow: "Seen fast · No ED wait",
      headlineHTML: 'Sports injury? <span class="text-teal-200">Seen fast.</span>',
      subtext: "Emergency Physicians treat sprains, strains and joint injuries on-site with imaging. Trusted by local clubs.",
      primaryCta: { label: "Online check-in", href: "#checkin" },
      secondaryCta: { label: "Book follow-up", action: "openBooking", service: "Sports Injury" },
      highlightService: "Sports Injury",
      ribbonText: "You're viewing our Sports Injury info",
      stickyCta: { label: "Online check-in", href: "#checkin" },
      services: ["Sports Injury", "Physiotherapy", "Fracture Clinic", "Interventional Radiology", "Paediatrics", "Infusion Clinic"],
      intentsOrder: ["now", "imaging", "infusion"],
      bookingService: "Sports Injury",
      checkinService: "Sports Injury",
      triagePreset: { answer: "category", option: "Injury (sprain, fracture, wound)" },
      hideSections: [],
    },
    infusion: {
      id: "infusion",
      name: "Iron Infusion",
      eyebrow: "By appointment · Under 1 hour",
      headlineHTML: 'Iron infusion in <span class="text-teal-200">under an hour.</span>',
      subtext: "Skip the long ED wait. Book a private infusion suite with our team — referrals welcome.",
      primaryCta: { label: "Book infusion", action: "openBooking", service: "Infusion Clinic" },
      secondaryCta: { label: "See pricing", href: "#pricing" },
      highlightService: "Infusion Clinic",
      ribbonText: "You're viewing our Infusion Clinic info",
      stickyCta: { label: "Book infusion", action: "openBooking", service: "Infusion Clinic" },
      services: ["Infusion Clinic", "Paediatrics", "Sports Injury", "Fracture Clinic", "Interventional Radiology", "Physiotherapy"],
      intentsOrder: ["infusion", "now", "imaging"],
      bookingService: "Infusion Clinic",
      pricingPreset: { medicare: "no", insurance: "no", workcover: "no" },
      hideSections: ["intents"],
    },
    kids: {
      id: "kids",
      name: "Kids / Paediatrics",
      eyebrow: "Ages 3 months +",
      headlineHTML: 'Sick child? <span class="text-teal-200">In-house paediatricians.</span>',
      subtext: "Calm, child-friendly care by paediatric-trained Emergency Physicians. No long ED waits.",
      primaryCta: { label: "Book / Walk in", action: "openBooking", service: "Paediatrics" },
      secondaryCta: { label: "What we treat", href: "#triage" },
      highlightService: "Paediatrics",
      ribbonText: "You're viewing our Paediatric info",
      stickyCta: { label: "Walk in / Book", action: "openBooking", service: "Paediatrics" },
      services: ["Paediatrics", "Fracture Clinic", "Sports Injury", "Infusion Clinic", "Interventional Radiology", "Physiotherapy"],
      intentsOrder: ["now", "imaging", "infusion"],
      bookingService: "Paediatrics",
      checkinService: "Paediatrics",
      triagePreset: { answer: "age", option: "Yes" },
      hideSections: [],
    },
    paeds: { id: "paeds", name: "Kids / Paediatrics", eyebrow: "Ages 3 months +", headlineHTML: 'Sick child? <span class="text-teal-200">In-house paediatricians.</span>', subtext: "Calm, child-friendly care by paediatric-trained Emergency Physicians.", primaryCta: { label: "Book / Walk in", action: "openBooking", service: "Paediatrics" }, secondaryCta: { label: "What we treat", href: "#triage" }, highlightService: "Paediatrics", ribbonText: "You're viewing our Paediatric info", stickyCta: { label: "Walk in / Book", action: "openBooking", service: "Paediatrics" }, services: ["Paediatrics", "Fracture Clinic", "Sports Injury", "Infusion Clinic", "Interventional Radiology", "Physiotherapy"], intentsOrder: ["now", "imaging", "infusion"], bookingService: "Paediatrics", hideSections: [] },
  },
  campaignPreviewOrder: ["default", "flu", "sports", "infusion", "kids"],

  // Tier 1 — trust bar stats
  trustStats: [
    { value: "4.9★", label: "Google rating", sub: "from 1,200+ reviews", icon: "star" },
    { value: "12 min", label: "Median urgent care wait", sub: "vs 2–4 hrs in hospital EDs", icon: "clock" },
    { value: "20,000+", label: "Patients treated", sub: "since opening", icon: "users" },
    { value: "3 mo+", label: "Ages seen", sub: "children welcome", icon: "shield" },
  ],

  // Tier 2 — intent-based entry cards
  intents: [
    { id: "now", icon: "ambulance", title: "I need care now", sub: "Walk in for minor emergencies", action: { href: "#wait" } },
    { id: "imaging", icon: "scan", title: "Imaging & x-ray", sub: "X-ray, ultrasound on-site", action: { href: "#services" } },
    { id: "infusion", icon: "syringe", title: "Iron infusion", sub: "Book a private suite", action: { action: "openBooking", service: "Infusion Clinic" } },
  ],

  // Tier 2 — amenities
  amenities: [
    { icon: "parking", label: "Free parking" },
    { icon: "wifi", label: "Free WiFi" },
    { icon: "wheelchair", label: "Wheelchair access" },
    { icon: "baby", label: "Kids' corner" },
    { icon: "coffee", label: "Coffee nearby" },
    { icon: "lift", label: "Lift access" },
  ],

  // Tier 2 — what to expect (journey)
  journeySteps: [
    { icon: "clipboard", title: "Check in", body: "Front-desk paperwork and Medicare details (~2 min)." },
    { icon: "stethoscope", title: "Triage", body: "Nurse takes vitals and sets your priority." },
    { icon: "doctor", title: "See the doctor", body: "Emergency Physician assesses and orders any imaging or tests." },
    { icon: "pill", title: "Treatment & plan", body: "On-site care, prescriptions, referrals or follow-up booked." },
    { icon: "check", title: "Discharge", body: "Clear written plan, scripts and any follow-up appointments." },
  ],

  // Tier 2 — what to bring
  bringItems: [
    { icon: "id", title: "Photo ID & Medicare card", body: "Required for the facility fee rebate." },
    { icon: "card", title: "Private health fund card", body: "If applicable — we'll process on the spot." },
    { icon: "pill", title: "Current medications list", body: "Or bring the bottles themselves." },
    { icon: "scan", title: "Any prior imaging or results", body: "Helps the doctor compare and avoid repeats." },
    { icon: "wallet", title: "Payment method", body: "EFTPOS, credit card or cash for the facility fee." },
  ],

  // Tier 1 — triage questions and outcomes
  triageQuestions: [
    {
      id: "age",
      text: "Is the patient over 3 months old?",
      options: [
        { label: "Yes", next: "severity" },
        { label: "No", outcome: "call000" },
      ],
    },
    {
      id: "severity",
      text: "Is this life-threatening (chest pain, severe bleeding, stroke symptoms, trouble breathing)?",
      options: [
        { label: "Yes", outcome: "call000" },
        { label: "No", next: "category" },
      ],
    },
    {
      id: "category",
      text: "Which best describes the visit?",
      options: [
        { label: "Injury (sprain, fracture, wound)", outcome: "walkin" },
        { label: "Illness (fever, infection, pain)", outcome: "walkin" },
        { label: "Planned therapy (infusion, follow-up)", outcome: "book" },
      ],
    },
  ],
  triageOutcomes: {
    walkin: { icon: "ambulance", title: "Walk in now", body: "Average wait ~12 min. Bring ID and Medicare card. No appointment needed.", cta: { label: "Get directions", href: "#location" } },
    book: { icon: "clipboard", title: "Book an appointment", body: "Use Book Now for the fastest slot. Referrals welcome.", cta: { label: "Book now", action: "openBooking" } },
    call000: { icon: "phone", title: "Call 000 now", body: "This sounds like an emergency. Don't wait — call 000 or go to your nearest ED.", cta: { label: "Get directions to nearest ED", href: "#location" } },
  },

  // Tier 1 — pricing scenarios
  pricingScenarios: {
    facilityFee: 396,
    medicareRebate: 41.40,
    items: [
      { id: "insured", label: "Insured (Medicare + private)", outOfPocket: "$0–$50", note: "Private health typically covers the gap — check your policy." },
      { id: "medicareOnly", label: "Medicare only", outOfPocket: "$355", note: "Medicare rebate of ~$41.40 applies; remainder is the facility fee." },
      { id: "uninsured", label: "No Medicare / overseas", outOfPocket: "$396", note: "Full facility fee, no rebate applied." },
      { id: "workcover", label: "WorkCover / DVA", outOfPocket: "$0", note: "Billed directly to insurer." },
    ],
  },

  // Tier 1 — queue position (session state lives in app.js)
  queuePosition: { currentInQueue: 3, avgMinsPerPatient: 6, prefix: "You're #" },

  // Tier 1 — test results portal
  testResultsSample: {
    login: { demoUser: "demo", demoPass: "demo" },
    results: [
      { date: "2026-08-12", test: "Wrist X-ray (L)", result: "No fracture identified", status: "Reviewed by Dr Manivel" },
      { date: "2026-07-30", test: "Iron studies panel", result: "Ferritin 28 ng/mL (low)", status: "Follow-up infusion booked" },
      { date: "2026-07-15", test: "COVID-19 PCR", result: "Negative", status: "Reviewed" },
    ],
  },

  // ---- Phase I: AI surfaces (all mocked, grounded in SWIFT_DATA) ----

  // I1 — AI symptom checker: keyword maps → triage outcome keys.
  aiSymptomRules: {
    emergencies: [
      { pattern: /(chest pain|stroke|severe bleeding|can'?t breathe|unconscious|seizure)/i, label: "emergency" },
    ],
    injuries: [
      { pattern: /(sprain|strain|fracture|broken|twisted|wrist|ankle|knee|back|cut|wound|burn)/i, label: "injury" },
    ],
    illness: [
      { pattern: /(fever|flu|cold|cough|sore throat|vomit|nausea|infection|ear|sinus|rash|diarrh)/i, label: "illness" },
    ],
    book: [
      { pattern: /(infusion|iron|referral|follow[- ]?up|repeat script|script|medication)/i, label: "planned care" },
    ],
    fallback: "Sorry, I couldn't match that. Tap 'Can we treat this?' for the step-by-step checker.",
  },

  // I2 — grounded AI concierge: regex patterns → answer functions that read SWIFT_DATA.
  aiConciergeIntents: [
    { id: "hours", patterns: [/open|hours|close|today|tomorrow/i],
      answer: function (D) { return "We're open " + D.clinic.hours + "."; } },
    { id: "wait", patterns: [/wait|busy|queue|long/i],
      answer: function (D) {
        const others = D.waitTimes.hospitals.slice(1).map(function (h) { return h.name + " " + h.mins + "m"; }).join(", ");
        return "Current urgent care wait is about " + D.waitTimes.swiftCurrentMins + " min. Hospital EDs for comparison: " + others + ".";
      } },
    { id: "cost", patterns: [/cost|price|fee|pay|medicare|insurance|gap|rebate/i],
      answer: function (D) {
        const items = D.pricingScenarios.items.map(function (i) { return i.label + " " + i.outOfPocket; }).join("; ");
        return D.clinic.facilityFee + " Out-of-pocket by scenario: " + items + ".";
      } },
    { id: "treat", patterns: [/treat|service|offer|child|kid|paediatric|infusion|x-?ray|sport|physio|fracture/i],
      answer: function (D) { return "We treat: " + D.services.map(function (s) { return s.name; }).join(", ") + ". Ages 3 months +."; } },
    { id: "book", patterns: [/book|appointment|appt|reserve|slot/i],
      answer: function () { return "For planned therapies like iron infusions, tap Book Now. For minor emergencies, just walk in."; } },
    { id: "location", patterns: [/where|location|address|direction|parking|find/i],
      answer: function (D) { return D.clinic.address + ". Free parking on-site."; },
      cta: { label: "Open in Google Maps", action: "getDirections" } },
    { id: "triage", patterns: [/triage|should i come|what.*wrong|symptoms/i],
      answer: function () { return "Try 'Can we treat this?' in the Before-you-visit hub — three questions and we'll tell you walk in, book, or call 000."; } },
    { id: "results", patterns: [/results|test|x-?ray|scan|portal/i],
      answer: function () { return "Demo test results are under 'More — Test results & Referrals'. Use demo / demo."; } },
    { id: "queue", patterns: [/queue|wait list|reserve|online check/i],
      answer: function () { return "Use Online Check-in to reserve your spot — you'll see your queue number and an estimated wait."; } },
  ],

  // I3 — wait-time sparkline history (rolling buffer of last 7 readings).
  waitTrend: [10, 13, 11, 12, 14, 11, 12],

  // I5 — FAQ entries feed both the JSON-LD FAQPage and the visible accordion.
  faq: [
    { q: "Do I need an appointment?", a: "No — walk in for minor emergencies. For planned therapies (iron infusions, follow-ups) tap Book Now." },
    { q: "How much does it cost?", a: "$396 facility fee + Medicare charges (reimbursed with a valid Medicare card). Insured patients typically pay $0–$50 out-of-pocket." },
    { q: "What ages do you treat?", a: "Children 3 months and older, and adults of any age. In-house paediatricians for kids." },
    { q: "How long is the wait?", a: "Median urgent care wait is about 12 minutes, versus 2–4 hours in hospital EDs. Live wait times refresh every minute." },
    { q: "Where are you located?", a: "G38, 32 Civic Way, Rouse Hill NSW 2155. Free parking on-site. Tap 'Open in Google Maps' for directions." },
    { q: "Do you do X-rays and imaging?", a: "Yes — on-site X-ray and ultrasound. Interventional radiology and image-guided pain management available." },
    { q: "Can I get my test results online?", a: "Yes — under More → Test results & Referrals. Sign in with demo / demo for the demo." },
    { q: "What if it's a life-threatening emergency?", a: "Call 000 immediately or go to your nearest hospital ED. Our triage checker is for non-life-threatening concerns only." },
  ],

  // Tier 2 — accessibility translations (small key-value map; falls back to English)
  translations: {
    en: {
      bookNow: "Book Now",
      checkIn: "Check-in",
      waitTimes: "Wait Times",
      pricing: "Pricing",
      services: "Services",
      doctors: "Doctors",
      location: "Location",
      contact: "Contact",
      requestAppointment: "Request Appointment",
      checkWaitTimes: "Check Wait Times",
      openDaily: "Open daily",
      getDirections: "Get Directions",
      sendEnquiry: "Send Enquiry",
      startTriage: "Start triage",
      calculateEstimate: "Calculate estimate",
      ourServices: "Our Services",
      ourDoctors: "Our Doctors",
      liveWaitTimes: "Live Wait Times",
      findUs: "Find Us",
      enquiriesBookings: "Enquiries & Bookings",
      canWeTreat: "Can we treat this?",
    },
    es: {
      bookNow: "Reservar",
      checkIn: "Registrarse",
      waitTimes: "Tiempos de espera",
      pricing: "Precios",
      services: "Servicios",
      doctors: "Doctores",
      location: "Ubicación",
      contact: "Contacto",
      requestAppointment: "Solicitar cita",
      checkWaitTimes: "Ver tiempos de espera",
      openDaily: "Abierto todos los días",
      getDirections: "Cómo llegar",
      sendEnquiry: "Enviar consulta",
      startTriage: "Iniciar triaje",
      calculateEstimate: "Calcular estimación",
      ourServices: "Nuestros servicios",
      ourDoctors: "Nuestros doctores",
      liveWaitTimes: "Tiempos de espera en vivo",
      findUs: "Encuéntranos",
      enquiriesBookings: "Consultas y reservas",
      canWeTreat: "¿Podemos tratar esto?",
    },
    zh: {
      bookNow: "立即预约",
      checkIn: "登记",
      waitTimes: "等待时间",
      pricing: "费用",
      services: "服务",
      doctors: "医生",
      location: "位置",
      contact: "联系",
      requestAppointment: "请求预约",
      checkWaitTimes: "查看等待时间",
      openDaily: "每日开放",
      getDirections: "获取路线",
      sendEnquiry: "发送咨询",
      startTriage: "开始分诊",
      calculateEstimate: "费用估算",
      ourServices: "我们的服务",
      ourDoctors: "我们的医生",
      liveWaitTimes: "实时等待时间",
      findUs: "查找我们",
      enquiriesBookings: "咨询与预约",
      canWeTreat: "我们能治疗这个吗?",
    },
  },
};
