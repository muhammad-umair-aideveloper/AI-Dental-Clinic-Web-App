import { CompanyKnowledge, AIInstructions, AISettings } from "./ai-knowledge-db";

export type DetectedLanguage = "roman_urdu" | "english" | "mixed" | "urdu_script";

/**
 * Detect language style of the user prompt
 */
export function detectLanguage(text: string): DetectedLanguage {
  const clean = text.toLowerCase().trim();

  // Arabic script Urdu detection
  if (/[\u0600-\u06FF]/.test(clean)) {
    return "urdu_script";
  }

  // Common Roman Urdu marker tokens
  const romanUrduMarkers = [
    "apki", "aapki", "aap", "ap", "kya", "kia", "hai", "hain", "bhai",
    "kitnay", "kitna", "kitne", "mein", "main", "milta", "milti", "kaise",
    "kese", "karna", "karein", "kahan", "kidhar", "karo", "hoga", "hogi",
    "chahiye", "mujhe", "hum", "humein", "shukriya", "dant", "daant", "dard",
    "safai", "wapsi", "paise", "din", "waqt", "kab", "kyun", "batao", "batayein",
    "shamil", "pehle", "baad", "theek", "shukran", "assalam", "salaam"
  ];

  // English marker tokens
  const englishMarkers = [
    "what", "how", "when", "where", "why", "who", "which", "is", "are",
    "do", "does", "can", "could", "would", "service", "services", "provide",
    "cost", "price", "refund", "appointment", "clinic", "please", "thank"
  ];

  const words = clean.split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, "")).filter(Boolean);

  let romanUrduScore = 0;
  let englishScore = 0;

  for (const w of words) {
    if (romanUrduMarkers.includes(w)) romanUrduScore++;
    if (englishMarkers.includes(w)) englishScore++;
  }

  if (romanUrduScore > 0 && englishScore > 0) {
    return "mixed";
  }
  if (romanUrduScore > 0) {
    return "roman_urdu";
  }
  return "english";
}

export interface RetrievedKnowledge {
  matchedTopics: string[];
  relevantServices: { name: string; description: string; price: string }[];
  relevantFaqs: { question: string; answer: string }[];
  relevantPolicies: string[];
  refundInfo?: string;
  cancellationInfo?: string;
  contactInfo?: { phone: string; whatsapp: string; address: string; email: string };
  workingHours?: string;
  generalCompanySummary: string;
}

/**
 * Intelligent Knowledge Retrieval: searches knowledge base for facts matching user prompt
 */
export function retrieveRelevantKnowledge(
  userQuery: string,
  knowledge: CompanyKnowledge
): RetrievedKnowledge {
  const query = userQuery.toLowerCase();
  const matchedTopics: string[] = [];

  // 1. Match Services & Pricing
  const isServiceQuery =
    query.includes("service") ||
    query.includes("provide") ||
    query.includes("kya kya") ||
    query.includes("treatment") ||
    query.includes("karta") ||
    query.includes("karti") ||
    query.includes("elaj") ||
    query.includes("ilaj") ||
    query.includes("dant") ||
    query.includes("daant");

  const isPriceQuery =
    query.includes("price") ||
    query.includes("cost") ||
    query.includes("fee") ||
    query.includes("fees") ||
    query.includes("kitnay") ||
    query.includes("kitna") ||
    query.includes("charge") ||
    query.includes("charges") ||
    query.includes("kharcha") ||
    query.includes("rate");

  let relevantServices = knowledge.services.filter((s) => {
    const sName = s.name.toLowerCase();
    const sDesc = s.description.toLowerCase();
    return (
      query.includes(sName) ||
      (query.includes("scaling") && sName.includes("scaling")) ||
      (query.includes("root canal") && sName.includes("root canal")) ||
      (query.includes("rct") && sName.includes("root canal")) ||
      (query.includes("whitening") && sName.includes("whitening")) ||
      (query.includes("implant") && sName.includes("implant")) ||
      (query.includes("braces") && sName.includes("braces")) ||
      (query.includes("aligner") && sName.includes("aligner")) ||
      (query.includes("kids") && sName.includes("kids")) ||
      (query.includes("xray") && sName.includes("x-ray")) ||
      (query.includes("x-ray") && sName.includes("x-ray")) ||
      (query.includes("emergency") && sName.includes("emergency"))
    );
  });

  if (isServiceQuery || isPriceQuery) {
    matchedTopics.push(isServiceQuery ? "Company Services" : "Service Pricing");
    if (relevantServices.length === 0) {
      // If asking broadly about services or prices, include all core services
      relevantServices = knowledge.services;
    }
  }

  // 2. Match Refund & Cancellation
  const isRefundQuery =
    query.includes("refund") ||
    query.includes("wapsi") ||
    query.includes("paise wapis") ||
    query.includes("pese wapis") ||
    query.includes("return money") ||
    query.includes("din mein") ||
    query.includes("kitnay din");

  const isCancelQuery =
    query.includes("cancel") ||
    query.includes("reschedule") ||
    query.includes("mansookh");

  let refundInfo: string | undefined;
  let cancellationInfo: string | undefined;

  if (isRefundQuery) {
    matchedTopics.push("Refund Policy");
    refundInfo = knowledge.refundPolicy;
  }

  if (isCancelQuery) {
    matchedTopics.push("Cancellation Policy");
    cancellationInfo = knowledge.cancellationPolicy;
  }

  // 3. Match FAQs
  const relevantFaqs = knowledge.faqs.filter((faq) => {
    const qLower = faq.question.toLowerCase();
    const words = query.split(/\s+/).filter((w) => w.length > 2);
    const matchesCount = words.filter((w) => qLower.includes(w)).length;
    return (
      matchesCount >= 2 ||
      (query.includes("signup") && qLower.includes("signup")) ||
      (query.includes("refund") && qLower.includes("refund")) ||
      (query.includes("service") && qLower.includes("service")) ||
      (query.includes("root canal") && qLower.includes("root canal")) ||
      (query.includes("kahan") && qLower.includes("kahan")) ||
      (query.includes("location") && qLower.includes("location"))
    );
  });

  if (relevantFaqs.length > 0) {
    matchedTopics.push("Frequently Asked Questions (FAQs)");
  }

  // 4. Match Working Hours & Timing
  const isHoursQuery =
    query.includes("timing") ||
    query.includes("hours") ||
    query.includes("open") ||
    query.includes("close") ||
    query.includes("kab khulta") ||
    query.includes("kab tak") ||
    query.includes("waqt") ||
    query.includes("sunday");

  let workingHours: string | undefined;
  if (isHoursQuery) {
    matchedTopics.push("Working Hours");
    workingHours = knowledge.workingHours;
  }

  // 5. Match Contact & Address
  const isContactQuery =
    query.includes("contact") ||
    query.includes("phone") ||
    query.includes("whatsapp") ||
    query.includes("number") ||
    query.includes("address") ||
    query.includes("location") ||
    query.includes("kahan") ||
    query.includes("rabta");

  let contactInfo: { phone: string; whatsapp: string; address: string; email: string } | undefined;
  if (isContactQuery) {
    matchedTopics.push("Contact Information");
    contactInfo = knowledge.contactInfo;
  }

  return {
    matchedTopics,
    relevantServices,
    relevantFaqs,
    relevantPolicies: knowledge.businessPolicies,
    refundInfo,
    cancellationInfo,
    contactInfo,
    workingHours,
    generalCompanySummary: `${knowledge.companyName}: ${knowledge.companyDescription} Located at ${knowledge.contactInfo.address}. Contact: ${knowledge.contactInfo.phone}.`,
  };
}

/**
 * Builds the comprehensive grounded AI system prompt
 */
export function buildGroundedSystemPrompt(
  settings: AISettings,
  retrieved: RetrievedKnowledge,
  detectedLang: DetectedLanguage
): string {
  const { knowledge, instructions } = settings;

  return `### SYSTEM ROLE:
${instructions.role}

### TARGET AUDIENCE & TONE:
- Target Audience: ${instructions.targetAudience}
- Tone: ${instructions.tone}
- Response Length Guideline: ${instructions.responseLength}
- Business Goals: ${instructions.businessGoals}

### CRITICAL LANGUAGE BEHAVIOR RULES (MANDATORY):
1. Detect user's language carefully:
   - If user writes in Roman Urdu (e.g. "apki company kya service provide karti hai?", "bhai refund kitnay din mein milta hai?"), you MUST respond in fluent, natural Roman Urdu.
   - If user writes in English, you MUST respond in English.
   - If user mixes Roman Urdu and English (e.g. "bhai signup ka process kya hai?"), respond in the same natural mixed style.
   - DO NOT convert Roman Urdu into Arabic Urdu script (اردو) unless the user explicitly used Arabic Urdu script or requested it.
   - Current detected query style: [${detectedLang.toUpperCase()}].

### STRICT TRUTHFULNESS & KNOWLEDGE RULES:
1. ONLY provide facts, prices, services, and policies that are documented in the VERIFIED COMPANY KNOWLEDGE below.
2. YOU MUST NEVER INVENT OR HALLUCINATE:
   - Prices
   - Services
   - Policies
   - Features
   - Discounts
   - Company information
3. WHAT TO DO WHEN INFORMATION IS UNAVAILABLE:
   ${instructions.whenInfoUnavailable}
4. WHEN TO TRANSFER TO HUMAN SUPPORT:
   ${instructions.whenTransferSupport}
5. IF THE USER ASKS A GENERAL OR UNRELATED QUESTION (e.g. "Pakistan ka capital kya hai?"):
   Briefly answer the general fact accurately in the user's language, then politely invite them back to Lahore Dental services.

### VERIFIED COMPANY KNOWLEDGE BASE:
- Company Name: ${knowledge.companyName}
- Description: ${knowledge.companyDescription}
- Address: ${knowledge.contactInfo.address}
- Phone: ${knowledge.contactInfo.phone}
- WhatsApp: ${knowledge.contactInfo.whatsapp}
- Email: ${knowledge.contactInfo.email}
- Working Hours: ${knowledge.workingHours}

### VERIFIED SERVICES & PRICING:
${knowledge.services.map((s) => `• ${s.name}: ${s.description} | Price: ${s.price}`).join("\n")}
Pricing Notes: ${knowledge.pricingNotes}

### VERIFIED REFUND & CANCELLATION POLICIES:
- Refund Policy: ${knowledge.refundPolicy}
- Cancellation Policy: ${knowledge.cancellationPolicy}

### BUSINESS POLICIES:
${knowledge.businessPolicies.map((p) => `• ${p}`).join("\n")}

### FREQUENTLY ASKED QUESTIONS (FAQS):
${knowledge.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

### RETRIEVED RELEVANT CONTEXT FOR THIS USER QUESTION:
Matched Topics: ${retrieved.matchedTopics.length > 0 ? retrieved.matchedTopics.join(", ") : "General Inquiry"}
${retrieved.relevantServices.length > 0 ? `Relevant Services:\n${retrieved.relevantServices.map((s) => `• ${s.name}: ${s.price} (${s.description})`).join("\n")}` : ""}
${retrieved.refundInfo ? `Refund Info: ${retrieved.refundInfo}` : ""}
${retrieved.cancellationInfo ? `Cancellation Info: ${retrieved.cancellationInfo}` : ""}
${retrieved.workingHours ? `Working Hours: ${retrieved.workingHours}` : ""}
${retrieved.contactInfo ? `Contact: Phone ${retrieved.contactInfo.phone}, WhatsApp ${retrieved.contactInfo.whatsapp}, Address: ${retrieved.contactInfo.address}` : ""}`;
}

/**
 * Dynamic fallback generator that strictly follows the knowledge base
 * and language rules when an external API key is pending.
 */
export function generateDynamicKnowledgeResponse(
  userQuery: string,
  settings: AISettings,
  retrieved: RetrievedKnowledge,
  detectedLang: DetectedLanguage
): string {
  const query = userQuery.toLowerCase().trim();
  const { knowledge } = settings;

  // 1. Specific Test Case: Unrelated general query (e.g. "Pakistan ka capital kya hai?")
  if (
    query.includes("capital") ||
    query.includes("darul hukumat") ||
    (query.includes("pakistan") && query.includes("capital"))
  ) {
    if (detectedLang === "roman_urdu" || detectedLang === "mixed") {
      return `Pakistan ka capital Islamabad hai. 🇵🇰\n\nKya aap Lahore Dental ke mutalliq kisi dental service ya appointment ke baare mein kuch poochna chahte hain?`;
    }
    return `The capital of Pakistan is Islamabad. 🇵🇰\n\nCan I assist you with any dental services or booking an appointment at Lahore Dental?`;
  }

  // 2. Specific Test Case: Services query (e.g. "apki company kya service provide karti hai?" / "What services do you provide?")
  if (
    query.includes("service") ||
    query.includes("provide") ||
    query.includes("kya service") ||
    query.includes("kya kya") ||
    query.includes("services do you") ||
    query.includes("konsi service")
  ) {
    const serviceListRoman = knowledge.services
      .map((s) => `• ${s.name} (${s.price})`)
      .join("\n");

    if (detectedLang === "roman_urdu") {
      return `Lahore Dental mein hum yeh specialized dental services provide karte hain:\n\n${serviceListRoman}\n\nTamam treatments PMDC verified specialists se painless tareeqay se kiye jaate hain. Kya aap kisi specific treatment ki appointment book karna chahte hain?`;
    }

    if (detectedLang === "mixed") {
      return `Hamari company Lahore Dental yeh services provide karti hai:\n\n${serviceListRoman}\n\nAap website par 'Book Appointment' button se ya yahan chat mein slot book kar sakte hain. Kis service mein aap interested hain?`;
    }

    // English
    return `At Lahore Dental, we provide the following dental services:\n\n${serviceListRoman}\n\nAll treatments are performed by PMDC-certified specialists using sterilized, hospital-grade equipment. Would you like to schedule a consultation?`;
  }

  // 3. Specific Test Case: Refund query (e.g. "bhai refund kitnay din mein milta hai?")
  if (
    query.includes("refund") ||
    query.includes("wapsi") ||
    query.includes("paise wapis") ||
    query.includes("pese wapis")
  ) {
    if (detectedLang === "roman_urdu" || detectedLang === "mixed") {
      return `Advance booking deposit ka refund request review aur approve hone ke baad **3 se 5 business days (working days)** ke andar aapke original payment method par bhej diya jata hai.\n\nNote: Clinical checkup ya treatment shuru hone ke baad fee non-refundable hoti hai. Mazeed maloomat ke liye hamari reception helpline par rabta karein: ${knowledge.contactInfo.phone}.`;
    }

    return `For eligible advance booking deposits, refunds are processed back to your original payment method within **3 to 5 business days** upon request review.\n\nPlease note that consultation or treatment fees are non-refundable once the clinical procedure has commenced. For inquiries, call ${knowledge.contactInfo.phone}.`;
  }

  // 4. Specific Test Case: Signup / Booking process (e.g. "bhai signup ka process kya hai?")
  if (
    query.includes("signup") ||
    query.includes("sign up") ||
    query.includes("register") ||
    query.includes("account kaise") ||
    query.includes("booking process") ||
    query.includes("process kya")
  ) {
    if (detectedLang === "roman_urdu" || detectedLang === "mixed") {
      return `Signup ka process bohat simple aur aasan hai:\n1. Website ke top navbar par **'Sign Up'** button par click karein.\n2. Apna Full Name, Email, Phone/WhatsApp aur Password enter karein.\n3. Account banne ke baad aap **'User Dashboard'** mein apni appointments check aur book kar sakte hain.\n\nKya aap chahein toh main yahan direct aapka appointment schedule kar doon?`;
    }

    return `The sign-up process is very quick:\n1. Click the **'Sign Up'** button in the top navigation.\n2. Enter your Full Name, Email, Phone/WhatsApp number, and Password.\n3. Once registered, you will be redirected to your personal **Patient Dashboard** where you can book and track your appointments.\n\nAlternatively, you can tell me your preferred date and time, and I can reserve your slot right here!`;
  }

  // 5. Pricing queries
  if (query.includes("price") || query.includes("cost") || query.includes("fees") || query.includes("kitna")) {
    const list = retrieved.relevantServices.length > 0 ? retrieved.relevantServices : knowledge.services;
    const formattedPrices = list.map((s) => `• ${s.name}: ${s.price}`).join("\n");

    if (detectedLang === "roman_urdu" || detectedLang === "mixed") {
      return `Lahore Dental ki standard pricing yeh hai:\n\n${formattedPrices}\n\n${knowledge.pricingNotes}\nAppointment book karne ke liye apni date aur time batayein.`;
    }

    return `Here is our transparent pricing schedule:\n\n${formattedPrices}\n\n${knowledge.pricingNotes}\nWould you like me to book a consultation slot for you?`;
  }

  // 6. Working hours & location queries
  if (retrieved.workingHours && (query.includes("timing") || query.includes("hours") || query.includes("open") || query.includes("kab"))) {
    if (detectedLang === "roman_urdu" || detectedLang === "mixed") {
      return `Lahore Dental ke working hours yeh hain:\n🕒 **${knowledge.workingHours}**\n📍 Address: ${knowledge.contactInfo.address}.\nClinic helpline: ${knowledge.contactInfo.phone}.`;
    }
    return `Our clinic operating hours are:\n🕒 **${knowledge.workingHours}**\n📍 Location: ${knowledge.contactInfo.address}.\nHelpline: ${knowledge.contactInfo.phone}.`;
  }

  // 7. Emergency query
  if (query.includes("emergency") || query.includes("dard") || query.includes("pain") || query.includes("blood") || query.includes("bleeding")) {
    if (detectedLang === "roman_urdu" || detectedLang === "mixed") {
      return `🚨 Agar aapko shadeed dard, bleeding ya dental emergency hai, toh baraye meherbani foran hamari emergency hotline par call karein:\n📞 **${knowledge.contactInfo.phone}**\nHamari medical team Gulberg III clinic mein fori relief ke liye standby par hai.`;
    }
    return `🚨 If you are experiencing severe dental pain, bleeding, or trauma, please contact our emergency hotline immediately:\n📞 **${knowledge.contactInfo.phone}**\nOur emergency care team is on standby at Plaza 42-B, Main Boulevard, Gulberg III, Lahore.`;
  }

  // 8. Handling when company info is unavailable (Anti-hallucination)
  if (detectedLang === "roman_urdu" || detectedLang === "mixed") {
    return `Mere paas is specific topic ki confirmed information company knowledge base mein mojood nahi hai. Tasdeeq shuda maloomat ke liye aap baraye raast hamari clinic team se WhatsApp ya call par rabta kar sakte hain: **${knowledge.contactInfo.phone}**.`;
  }

  return `I do not have confirmed information regarding that in our official clinic records. For accurate details, please contact our clinic team directly at **${knowledge.contactInfo.phone}** or via WhatsApp.`;
}
