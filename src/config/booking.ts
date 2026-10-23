/**
 * Booking configuration -- prices and closed dates.
 *
 * IMPORTANT: All prices below are PLACEHOLDER values.
 * VERIFY WITH CLIENT BEFORE LAUNCH and replace with real figures.
 */

export const TREATMENT_PRICES: Record<string, { pkr: number; note: string; noteUr: string }> = {
  "General Checkup & Consultation": {
    pkr: 1500, // PLACEHOLDER -- VERIFY WITH CLIENT
    note: "Includes clinical examination and X-ray review",
    noteUr: "کلینیکل معائنہ اور ایکس ری جائزہ شامل",
  },
  "Scaling & Ultrasonic Polishing": {
    pkr: 3500, // PLACEHOLDER -- VERIFY WITH CLIENT
    note: "Depends on calculus accumulation level",
    noteUr: "قیمت مسوڑھوں کی حالت اور گندگی کے تناسب پر ہے",
  },
  "Single-Visit Root Canal (RCT)": {
    pkr: 12000, // PLACEHOLDER -- VERIFY WITH CLIENT
    note: "Per tooth, includes digital apex measurement",
    noteUr: "فی دانت، ڈیجیٹل پیمائش کے ساتھ",
  },
  "Invisible Clear Aligners": {
    pkr: 75000, // PLACEHOLDER -- VERIFY WITH CLIENT
    note: "Custom 3D plan; installment plans available",
    noteUr: "ماہانہ اقساط کی سہولت بھی میسر ہے",
  },
  "Permanent Dental Implants": {
    pkr: 55000, // PLACEHOLDER -- VERIFY WITH CLIENT
    note: "Medical-grade bio-titanium root replacement",
    noteUr: "میڈیکل گریڈ بایو-ٹائٹینیم روٹ کی تنصیب",
  },
};

/**
 * Clinic closed dates in YYYY-MM-DD format (Asia/Karachi).
 * Add public holidays, Eid, etc. here.
 * Currently empty -- update before launch.
 */
export const CLINIC_CLOSED_DATES: string[] = [
  // "2026-06-15", // Example: Eid-ul-Adha Day 1 -- VERIFY WITH CLIENT
];
