import fs from "fs";
import path from "path";
import crypto from "crypto";
import { AppointmentRecord, getAllAppointments } from "./supabase";

export interface XRayRecord {
  id: string;
  title: string;
  category: "OPG" | "Periapical" | "Bitewing" | "Intraoral Photo";
  date: string;
  url: string;
  notes?: string;
}

export interface SecureLinkRecord {
  token: string;
  patientPhone: string;
  expiresAt: string; // ISO string
  maxViews: number;
  viewsLeft: number;
  revoked: boolean;
  createdAt: string;
  accessLogs: Array<{ accessedAt: string; ip?: string }>;
}

export interface PatientProfile {
  phone: string; // Unique primary key (Pakistani mobile format)
  name: string;
  email?: string;
  notes: string;
  noShowCount: number;
  advanceTokenRequired: boolean; // Auto-set if noShowCount >= 2
  createdAt: string;
  xrays: XRayRecord[];
}

const PATIENTS_FILE = path.join(process.cwd(), "data", "patients.json");
const SECURE_LINKS_FILE = path.join(process.cwd(), "data", "secure-links.json");

// In-memory cache
const globalPatients = globalThis as unknown as {
  __lahoreDentalPatients?: Map<string, PatientProfile>;
  __lahoreDentalSecureLinks?: Map<string, SecureLinkRecord>;
};

function ensureInitialized() {
  if (!globalPatients.__lahoreDentalPatients) {
    globalPatients.__lahoreDentalPatients = new Map();
    globalPatients.__lahoreDentalSecureLinks = new Map();

    // Load from disk if exists
    try {
      if (fs.existsSync(PATIENTS_FILE)) {
        const raw = fs.readFileSync(PATIENTS_FILE, "utf-8");
        const list: PatientProfile[] = JSON.parse(raw);
        list.forEach((p) => globalPatients.__lahoreDentalPatients!.set(p.phone, p));
      }
      if (fs.existsSync(SECURE_LINKS_FILE)) {
        const raw = fs.readFileSync(SECURE_LINKS_FILE, "utf-8");
        const list: SecureLinkRecord[] = JSON.parse(raw);
        list.forEach((l) => globalPatients.__lahoreDentalSecureLinks!.set(l.token, l));
      }
    } catch (err) {
      console.error("[patient-records] Failed reading data files:", err);
    }

    // Seed realistic clinic test records if empty
    if (globalPatients.__lahoreDentalPatients.size === 0) {
      const seedPatients: PatientProfile[] = [
        {
          phone: "03001234567",
          name: "Tariq Mahmood",
          email: "tariq.m@example.com",
          notes: "Patient prefers late morning appointments. Sensitive to cold water in lower right quadrant. Planned implant site #46.",
          noShowCount: 0,
          advanceTokenRequired: false,
          createdAt: "2026-08-14T10:00:00.000Z",
          xrays: [
            {
              id: "xr-101",
              title: "Pre-Op Full OPG Panoramic",
              category: "OPG",
              date: "2026-09-01",
              url: "/images/placeholders/sample-opg.svg",
              notes: "Evaluation for lower right molar implant fixture #46. Adequate bone height ~13mm.",
            },
            {
              id: "xr-102",
              title: "Periapical #46 Ridge Assessment",
              category: "Periapical",
              date: "2026-09-15",
              url: "/images/placeholders/sample-periapical.svg",
              notes: "Clear inferior alveolar nerve canal demarcation. No periapical pathology.",
            },
          ],
        },
        {
          phone: "03219876543",
          name: "Hina Naveed",
          email: "hina.n@example.com",
          notes: "Mild gingivitis with calculus in lower anterior lingual surfaces. Highly compliant with home oral hygiene instructions.",
          noShowCount: 1,
          advanceTokenRequired: false,
          createdAt: "2026-09-10T14:30:00.000Z",
          xrays: [
            {
              id: "xr-103",
              title: "Bitewing Left & Right Molars",
              category: "Bitewing",
              date: "2026-09-10",
              url: "/images/placeholders/sample-periapical.svg",
              notes: "No interproximal caries detected.",
            },
          ],
        },
        {
          phone: "03335558899",
          name: "Kamran Siddiqui",
          notes: "Missed two consecutive appointments without notice. Requires Rs. 2,000 advance confirmation token before blocking chair time.",
          noShowCount: 2,
          advanceTokenRequired: true,
          createdAt: "2026-07-22T11:15:00.000Z",
          xrays: [],
        },
      ];

      seedPatients.forEach((p) => globalPatients.__lahoreDentalPatients!.set(p.phone, p));
      savePatientsToDisk();
    }
  }
}

function savePatientsToDisk() {
  try {
    const dir = path.dirname(PATIENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const list = Array.from(globalPatients.__lahoreDentalPatients!.values());
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[patient-records] Failed saving patients:", err);
  }
}

function saveSecureLinksToDisk() {
  try {
    const dir = path.dirname(SECURE_LINKS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const list = Array.from(globalPatients.__lahoreDentalSecureLinks!.values());
    fs.writeFileSync(SECURE_LINKS_FILE, JSON.stringify(list, null, 2), "utf-8");
  } catch (err) {
    console.error("[patient-records] Failed saving secure links:", err);
  }
}

/**
 * Get or automatically create patient profile for a phone number
 */
export function getOrCreatePatient(phone: string, name?: string): PatientProfile {
  ensureInitialized();
  const cleanPhone = phone.trim();
  let patient = globalPatients.__lahoreDentalPatients!.get(cleanPhone);

  if (!patient) {
    patient = {
      phone: cleanPhone,
      name: name || "Patient " + cleanPhone.slice(-4),
      notes: "First recorded visit.",
      noShowCount: 0,
      advanceTokenRequired: false,
      createdAt: new Date().toISOString(),
      xrays: [],
    };
    globalPatients.__lahoreDentalPatients!.set(cleanPhone, patient);
    savePatientsToDisk();
  } else if (name && (!patient.name || patient.name.startsWith("Patient "))) {
    patient.name = name;
    savePatientsToDisk();
  }

  return patient;
}

/**
 * Get list of all patient profiles combined with their appointment history
 */
export async function getAllPatientProfiles(): Promise<
  Array<PatientProfile & { appointments: AppointmentRecord[] }>
> {
  ensureInitialized();
  const allAppointments = await getAllAppointments();

  // Ensure every phone from appointments has a patient profile
  allAppointments.forEach((apt) => {
    if (apt.phone) {
      getOrCreatePatient(apt.phone, apt.name);
    }
  });

  const profiles: Array<PatientProfile & { appointments: AppointmentRecord[] }> = [];

  for (const patient of globalPatients.__lahoreDentalPatients!.values()) {
    const patientAppointments = allAppointments.filter(
      (a) => a.phone === patient.phone || a.phone.endsWith(patient.phone.slice(-7))
    );

    profiles.push({
      ...patient,
      appointments: patientAppointments,
    });
  }

  return profiles.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Update patient notes or advance token requirement
 */
export function updatePatientProfile(
  phone: string,
  updates: Partial<Pick<PatientProfile, "notes" | "advanceTokenRequired" | "email" | "name">>
): PatientProfile | null {
  ensureInitialized();
  const patient = globalPatients.__lahoreDentalPatients!.get(phone);
  if (!patient) return null;

  if (updates.notes !== undefined) patient.notes = updates.notes;
  if (updates.advanceTokenRequired !== undefined)
    patient.advanceTokenRequired = updates.advanceTokenRequired;
  if (updates.email !== undefined) patient.email = updates.email;
  if (updates.name !== undefined) patient.name = updates.name;

  savePatientsToDisk();
  return patient;
}

/**
 * Increment no-show count and automatically flag advance token requirement if count >= 2
 */
export function recordNoShow(phone: string): {
  patient: PatientProfile;
  thresholdReached: boolean;
} {
  ensureInitialized();
  const patient = getOrCreatePatient(phone);
  patient.noShowCount += 1;

  // Auto-flag advance token required if no-show >= 2
  if (patient.noShowCount >= 2) {
    patient.advanceTokenRequired = true;
  }

  savePatientsToDisk();
  return {
    patient,
    thresholdReached: patient.advanceTokenRequired,
  };
}

/**
 * Add an X-Ray / OPG image record to the patient's file
 */
export function addPatientXRay(
  phone: string,
  record: Omit<XRayRecord, "id">
): XRayRecord {
  ensureInitialized();
  const patient = getOrCreatePatient(phone);
  const newRecord: XRayRecord = {
    ...record,
    id: "xr-" + Date.now().toString(36),
  };

  patient.xrays.unshift(newRecord);
  savePatientsToDisk();
  return newRecord;
}

/**
 * Generate a secure, expiring, view-limited signed link for sharing patient X-rays
 */
export function createSecurePatientLink(
  patientPhone: string,
  expiresInHours: number = 48,
  maxViews: number = 5
): SecureLinkRecord {
  ensureInitialized();
  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + expiresInHours * 3600000).toISOString();

  const record: SecureLinkRecord = {
    token,
    patientPhone,
    expiresAt,
    maxViews,
    viewsLeft: maxViews,
    revoked: false,
    createdAt: new Date().toISOString(),
    accessLogs: [],
  };

  globalPatients.__lahoreDentalSecureLinks!.set(token, record);
  saveSecureLinksToDisk();
  return record;
}

/**
 * Resolve and validate a secure link token
 */
export function accessSecurePatientLink(
  token: string,
  clientIp?: string
): {
  valid: boolean;
  error?: "expired" | "no_views_left" | "revoked" | "not_found";
  patient?: PatientProfile;
  record?: SecureLinkRecord;
} {
  ensureInitialized();
  const link = globalPatients.__lahoreDentalSecureLinks!.get(token);

  if (!link) {
    return { valid: false, error: "not_found" };
  }

  if (link.revoked) {
    return { valid: false, error: "revoked" };
  }

  if (new Date(link.expiresAt).getTime() < Date.now()) {
    return { valid: false, error: "expired" };
  }

  if (link.viewsLeft <= 0) {
    return { valid: false, error: "no_views_left" };
  }

  // Decrement views and record access log
  link.viewsLeft -= 1;
  link.accessLogs.push({
    accessedAt: new Date().toISOString(),
    ip: clientIp,
  });
  saveSecureLinksToDisk();

  const patient = globalPatients.__lahoreDentalPatients!.get(link.patientPhone);
  return {
    valid: true,
    patient,
    record: link,
  };
}

/**
 * Revoke an active secure link immediately
 */
export function revokeSecureLink(token: string): boolean {
  ensureInitialized();
  const link = globalPatients.__lahoreDentalSecureLinks!.get(token);
  if (!link) return false;

  link.revoked = true;
  saveSecureLinksToDisk();
  return true;
}
