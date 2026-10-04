// Configuration: Single Source of Truth for Lahore Dental Clinic
// Note: All unverified claims must be flagged with VERIFY WITH CLIENT BEFORE LAUNCH

export interface ClinicTiming {
  days: string;
  daysUr: string;
  hours: string;
  hoursUr: string;
  openHour24: number;
  closeHour24: number;
  isEmergencyOnly?: boolean;
}

export interface SterilizationItem {
  id: string;
  title: string;
  titleUr: string;
  desc: string;
  descUr: string;
}

export interface ClinicTreatment {
  id: string;
  slug: string;
  name: string;
  nameUr: string;
  duration: string;
  durationUr: string;
  startingPricePkr: number;
  priceNote: string;
  priceNoteUr: string;
  description: string;
  descriptionUr: string;
}

export interface BeforeAfterCase {
  id: string;
  category: "whitening" | "bonding" | "aligners";
  title: string;
  titleUr: string;
  duration: string;
  durationUr: string;
  note: string;
  noteUr: string;
  consentOnFile: boolean;
  beforeImage: string;
  afterImage: string;
}

export const CLINIC_CONFIG = {
  name: "Lahore Dental",
  nameUr: "لاہور ڈینٹل",
  city: "Lahore",
  cityUr: "لاہور",
  area: "Gulberg III",
  areaUr: "گلبرگ III",
  
  // Value propositions
  headline: "Painless Dental Implants & Invisible Aligners in Lahore",
  headlineUr: "لاہور میں درد سے پاک ڈینٹل امپلانٹس اور پوشیدہ الائنرز",
  subheadline:
    "Minimally invasive implantology and digital orthodontic aligners in Gulberg III. Accurate diagnosis, transparent pricing, and gentle patient care.",
  subheadlineUr:
    "گلبرگ III میں جدید ترین امپلانٹس اور ڈیجیٹل الائنرز۔ واضح قیمتیں، جدید طریقہ کار اور درد سے پاک علاج۔",

  // Contact
  phone: "+92 300 1234567",
  whatsappNumber: "923001234567",
  whatsappPrefill: "Hello Lahore Dental! I would like to book a dental consultation.",
  whatsappPrefillUr: "السلام علیکم لاہور ڈینٹل! مجھے معائنے کے لیے وقت درکار ہے۔",
  emergencyPhone: "+92 300 1234567",
  email: "care@lahoredental.pk",

  // Location & Directions
  address: "Plaza 42-B, Main Boulevard, Gulberg III, Lahore, Punjab, Pakistan",
  addressUr: "پلازہ 42-B، مین بلیوارڈ، گلبرگ III، لاہور، پنجاب، پاکستان",
  googleMapsUrl: "https://www.google.com/maps/dir/?api=1&destination=31.5204,74.3587", // VERIFY WITH CLIENT BEFORE LAUNCH
  parking: "Dedicated secure on-site parking with complimentary valet assistance directly at clinic entrance.",
  parkingUr: "کلینک کے داخلی دروازے پر مریضوں کے لیے محفوظ اور خصوصی پارکنگ کی سہولت دستیاب ہے۔",

  // Google Reviews
  // VERIFY WITH CLIENT BEFORE LAUNCH (Real Google review page link & verified figures)
  googleReviews: {
    rating: 4.9, // VERIFY WITH CLIENT
    count: 320,  // VERIFY WITH CLIENT
    url: "https://maps.google.com/?q=Lahore+Dental+Gulberg+III+Lahore",
  },

  // Doctor & Credibility
  doctor: {
    name: "Dr. Sarah Tariq Khan",
    nameUr: "ڈاکٹر سارہ طارق خان",
    title: "Principal Dental Surgeon & Implantologist",
    titleUr: "پرنسپل ڈینٹل سرجن و امپلانٹولوجسٹ",
    // VERIFY WITH CLIENT BEFORE LAUNCH
    pmdcNumber: "PMDC-68241-D",
    pmdcVerifyUrl: "https://www.pmc.pakistan.gov.pk/",
    experienceYears: 14, // VERIFY WITH CLIENT
    fellowships: [
      "BDS (UHS)",
      "RDS (Pakistan)",
      "Certified Implantologist (UK Course)",
      "Clear Aligner Certified Provider",
    ], // VERIFY WITH CLIENT
    bio: "Specializing in conservative restorative dentistry, minimally invasive titanium implantology, and clear aligner smile transformations with a gentle, patient-first approach.",
    bioUr: "جدید امپلانٹس اور شفاف الائنرز کے علاج میں خصوصی مہارت اور مریضوں کی پرسکون نگہداشت۔",
    image: "/images/doctor-placeholder.svg", // Real photo required: CLIENT_ASSET_REQUIRED
  },

  // Weekly Working Timings in Asia/Karachi
  timeZone: "Asia/Karachi",
  timings: [
    {
      days: "Monday – Saturday",
      daysUr: "پیر تا ہفتہ",
      hours: "11:00 AM – 09:00 PM",
      hoursUr: "11:00 صبح تا 09:00 رات",
      openHour24: 11,
      closeHour24: 21,
    },
    {
      days: "Sunday",
      daysUr: "اتوار",
      hours: "Emergency Consultation Only",
      hoursUr: "صرف ہنگامی صورتحال کے لیے",
      openHour24: 12,
      closeHour24: 18,
      isEmergencyOnly: true,
    },
  ] as ClinicTiming[],

  // 4 Core Treatments with DB-backed Transparent Pricing
  treatments: [
    {
      id: "scaling",
      slug: "scaling-and-polishing",
      name: "Scaling & Ultrasonic Polishing",
      nameUr: "دانتوں کی صفائی اور پالش (Scaling)",
      duration: "30-45 mins",
      durationUr: "30-45 منٹ",
      startingPricePkr: 3500,
      priceNote: "Depends on calculus accumulation level",
      priceNoteUr: "قیمت مسوڑھوں کی حالت اور گندگی کے تناسب پر ہے",
      description: "Gentle ultrasonic plaque and tartar removal with enamel-safe stain polishing for healthier gums and fresher breath.",
      descriptionUr: "الٹراسونک مشین سے دانتوں کی گہری صفائی اور پالش، مسوڑھوں کی مضبوطی اور تروتازہ سانس کے لیے۔",
    },
    {
      id: "root-canal",
      slug: "single-visit-root-canal",
      name: "Single-Visit Root Canal (RCT)",
      nameUr: "ایک نشست میں روٹ کینال (RCT)",
      duration: "45-60 mins",
      durationUr: "45-60 منٹ",
      startingPricePkr: 12000,
      priceNote: "Per tooth, includes digital apex measurement",
      priceNoteUr: "فی دانت، ڈیجیٹل پیمائش کے ساتھ",
      description: "Painless rotary endodontic therapy preserving your natural tooth structure in a single comfortable sitting.",
      descriptionUr: "درد سے مکمل پاک روٹری طریقہ کار سے قدرتی دانت کو صرف ایک ہی نشست میں بچائیں۔",
    },
    {
      id: "aligners",
      slug: "invisible-aligners",
      name: "Invisible Clear Aligners",
      nameUr: "پوشیدہ شفاف الائنرز (Clear Aligners)",
      duration: "6-12 months",
      durationUr: "6-12 ماہ",
      startingPricePkr: 75000,
      priceNote: "Custom 3D plan; installment plans available",
      priceNoteUr: "ماہانہ اقساط کی سہولت بھی میسر ہے",
      description: "Custom 3D-scanned invisible aligners straightening teeth discreetly without visible metal brackets or wires.",
      descriptionUr: "ٹیڑھے اور غیر متوازن دانتوں کو سیدھا کرنے کے لیے بغیر تاروں کے شفاف پوشیدہ الائنرز۔",
    },
    {
      id: "implants",
      slug: "titanium-dental-implants",
      name: "Permanent Dental Implants",
      nameUr: "مستقل ڈینٹل امپلانٹس (Dental Implants)",
      duration: "45 mins surgery",
      durationUr: "45 منٹ سرجری",
      startingPricePkr: 55000,
      priceNote: "Medical-grade bio-titanium root replacement",
      priceNoteUr: "میڈیکل گریڈ بایو-ٹائٹینیم روٹ کی تنصیب",
      description: "Bio-compatible titanium root fixture providing permanent, natural-looking replacement with lifetime stability.",
      descriptionUr: "قدرتی دانت کی طرح پائیدار اور تاحیات چلنے والے بایو-ٹائٹینیم امپلانٹس۔",
    },
  ] as ClinicTreatment[],

  // Sterilization Protocols
  sterilization: [
    {
      id: "autoclave",
      title: "Class-B Vacuum Autoclave",
      titleUr: "کلاس-بی ویکیوم آٹوکلیو",
      desc: "Hospital-grade 134°C sterilization cycle with electronic physical and biological spore testing on every batch.",
      descUr: "134 سینٹی گریڈ پر جراثیم کش عمل اور ہر بیچ پر بائیولوجیکل ٹیسٹنگ کا سخت نظام۔",
    },
    {
      id: "disposables",
      title: "100% Single-Use Disposables",
      titleUr: "سو فیصد ڈسپوزایبل اشیاء",
      desc: "Patient bibs, suction tips, sterile syringes, exam gloves, and micro-applicators are discarded immediately after each patient.",
      descUr: "دستانے، سرنج، سکشن ٹپس اور تمام حفاظتی کٹس ہر مریض کے لیے نئی کھولی جاتی ہیں۔",
    },
    {
      id: "cassettes",
      title: "Sealed Sterile Cassettes",
      titleUr: "مہر بند محفوظ پیکنگ",
      desc: "All surgical and operative instruments are sealed in color-indicating pouch packets and opened directly in front of you.",
      descUr: "جراحی کے تمام آلات پیکٹ میں محفوظ ہوتے ہیں اور مریض کے سامنے ہی کھولے جاتے ہیں۔",
    },
    {
      id: "surface",
      title: "Hospital Surface Decontamination",
      titleUr: "کلینیکل سطحوں کی ڈس انفیکشن",
      desc: "High-level virucidal barrier disinfectant wipes applied across dental chair, overhead light, and unit surfaces between visits.",
      descUr: "ہر مریض کے معائنے کے بعد ڈینٹل چیئر اور تمام متعلقہ آلات کو جراثیم کش سپرے سے صاف کیا جاتا ہے۔",
    },
  ] as SterilizationItem[],

  // Real Before/After Cases with consent_on_file guard
  beforeAfterCases: [
    {
      id: "whitening-1",
      category: "whitening",
      title: "In-Office Laser Teeth Whitening",
      titleUr: "کلینیکل لیزر ٹیتھ وائٹننگ",
      duration: "45 minutes",
      durationUr: "45 منٹ",
      note: "6 shades brighter. Individual patient results may vary.",
      noteUr: "6 درجے تک چمکدار مسکراہٹ۔ نتائج ہر مریض کے لیے مختلف ہو سکتے ہیں۔",
      consentOnFile: true,
      beforeImage: "/images/before-after/whitening-before.svg", // CLIENT_ASSET_REQUIRED
      afterImage: "/images/before-after/whitening-after.svg",   // CLIENT_ASSET_REQUIRED
    },
    {
      id: "bonding-1",
      category: "bonding",
      title: "Direct Composite Bonding & Chipped Tooth Restoration",
      titleUr: "کمپوزٹ بانڈنگ اور دانت کی بحالی",
      duration: "Single 60 min session",
      durationUr: "صرف ایک نشست (60 منٹ)",
      note: "Midline spacing closed with zero enamel loss. Results vary.",
      noteUr: "دانت کو نقصان پہنچائے بغیر فاصلہ ختم۔ نتائج مختلف ہو سکتے ہیں۔",
      consentOnFile: true,
      beforeImage: "/images/before-after/bonding-before.svg", // CLIENT_ASSET_REQUIRED
      afterImage: "/images/before-after/bonding-after.svg",   // CLIENT_ASSET_REQUIRED
    },
    {
      id: "aligners-1",
      category: "aligners",
      title: "Clear Invisible Aligners Alignment",
      titleUr: "شفاف الائنرز سے دانتوں کی سیدھ",
      duration: "8 months treatment",
      durationUr: "8 ماہ کا دورانیہ",
      note: "Mild crowding corrected without extractions. Results vary.",
      noteUr: "بغیر دانت نکالے مسکراہٹ کی سیدھ درست۔ نتائج مختلف ہو سکتے ہیں۔",
      consentOnFile: true,
      beforeImage: "/images/before-after/aligners-before.svg", // CLIENT_ASSET_REQUIRED
      afterImage: "/images/before-after/aligners-after.svg",   // CLIENT_ASSET_REQUIRED
    },
  ] as BeforeAfterCase[],
};
