/**
 * Clinical Guardrails & Output Filter
 * Strictly prevents the AI assistant from prescribing, suggesting, or mentioning
 * prescription medications, antibiotics, painkillers, or dosages.
 */

export const BLOCKED_DRUGS = [
  "amoxicillin",
  "amoxil",
  "augmentin",
  "clavulanic",
  "flagyl",
  "metronidazole",
  "ciprofloxacin",
  "cipro",
  "erythromycin",
  "azithromycin",
  "clarithromycin",
  "clindamycin",
  "cephalexin",
  "doxycycline",
  "ponstan",
  "mefenamic",
  "panadol",
  "paracetamol",
  "brufen",
  "ibuprofen",
  "diclofenac",
  "caflam",
  "voltaren",
  "tramadol",
  "synflex",
  "naproxen",
  "disprin",
  "aspirin",
  "ketorolac",
  "toradol",
  "amoxiclav",
  "klaricid",
  "zithromax",
  "dalacin",
  "velosef",
  "cefixime",
  "novidat",
  "lincomycin",
];

export const BLOCKED_DOSAGE_REGEX =
  /\b(\d+\s*(mg|milligram|milligramme|g|gm|ml|mcg|iu)|bd|tds|od|qds|500mg|250mg|625mg|1000mg|1g|400mg|100mg|50mg|200mg)\b|(\d+\s*ملی\s*گرام)/i;

export const MEDICATION_QUERY_REGEX =
  /\b(antibiotic|antibiotics|dawai|dawa|medicine|medicines|painkiller|painkillers|tablet|tablets|goli|goliyan|capsule|capsules|syrup|injection|injections|drops|drop|dose|dosage|khuraak|khoraak|prescribe|prescription|nuskha|nuskhah)\b/i;

// Urdu script medication keywords & transliterated drug names
export const URDU_MEDICATION_REGEX =
  /(اینٹی بائیوٹک|دوائی|دوا|گولی|گولیاں|کیپسول|نسخہ|درد کش|پین کلر|اینٹی بایوٹک|سیرپ|قطرے|ملی گرام|فلیجل|اگمنٹن|ایموکسیلن|بروفن|پونسٹان|پیناڈول|ڈسپرین|کالپول)/;

export interface GuardrailCheckResult {
  blocked: boolean;
  reason?: "medication_prescribed" | "dosage_mentioned" | "drug_name_detected";
  matchedTokens?: string[];
  safeResponse?: string;
}

/**
 * Checks whether an incoming prompt or query is asking for prescription medicines
 */
export function isAskingForMedication(prompt: string): boolean {
  return (
    MEDICATION_QUERY_REGEX.test(prompt) ||
    URDU_MEDICATION_REGEX.test(prompt) ||
    BLOCKED_DRUGS.some((drug) => new RegExp(`\\b${drug}\\b`, "i").test(prompt))
  );
}

/**
 * Generates the mandatory clinical refusal with slot offer
 */
export function getClinicalMedicationRefusal(lang: "roman_urdu" | "urdu_script" | "english" = "roman_urdu"): string {
  if (lang === "urdu_script") {
    return "میں کوئی دوائی، اینٹی بائیوٹک یا خوراک تجویز نہیں کر سکتا، کیونکہ PMDC ضوابط کے تحت دانتوں کے مسئلے کا براہِ راست معائنہ لازمی ہے۔ برائے مہربانی کلینک میں چیک اپ کے لیے وقت مقرر کریں تاکہ ڈاکٹر معائنے کے بعد درست علاج کر سکیں۔ کیا میں آج یا کل کے لیے آپ کا اپائنٹمنٹ سلاٹ بُک کر دوں؟";
  }

  if (lang === "english") {
    return "I cannot prescribe or recommend medications, antibiotics, or dosages, as PMDC clinical guidelines strictly require an in-person dental examination. Please schedule a clinical checkup with Dr. Sarah so we can properly evaluate the condition. Would you like me to reserve an appointment slot for you today or tomorrow?";
  }

  // Roman Urdu & Mixed (default for Pakistani patients)
  return "Main koi dawai, antibiotic ya dosage suggest nahi kar sakta, kyunki PMDC clinical guidelines ke mutabiq dant ka physical checkup zaroori hai. Barah-e-karam clinic mein checkup schedule karein taake Dr. Sarah mutassira jagah ka muayana kar sakein. Kya main aap ke liye aaj ya kal ka appointment slot book kar doon?";
}

/**
 * Output filter that sanitizes AI output: if any drug or dosage slips through,
 * it replaces the output with the safe clinical response.
 */
export function filterMedicationOutput(
  text: string,
  detectedLanguage: "roman_urdu" | "urdu_script" | "english" = "roman_urdu"
): { safeText: string; filtered: boolean; matchedTokens: string[] } {
  const matchedTokens: string[] = [];

  // Check for specific drug names
  for (const drug of BLOCKED_DRUGS) {
    const rx = new RegExp(`\\b${drug}\\b`, "i");
    if (rx.test(text)) {
      matchedTokens.push(drug);
    }
  }

  // Check for dosages
  const dosageMatch = text.match(BLOCKED_DOSAGE_REGEX);
  if (dosageMatch) {
    matchedTokens.push(dosageMatch[0]);
  }

  if (matchedTokens.length > 0) {
    return {
      safeText: getClinicalMedicationRefusal(detectedLanguage),
      filtered: true,
      matchedTokens,
    };
  }

  return {
    safeText: text,
    filtered: false,
    matchedTokens: [],
  };
}
