import crypto from "crypto";
import { AppointmentRecord, getAllAppointments, PatientRecord, XRayRecord, supabase } from "./supabase";

export interface SecureLinkRecord {
  token: string;
  patientPhone: string;
  expiresAt: string;
  maxViews: number;
  viewsLeft: number;
  revoked: boolean;
  createdAt: string;
  accessLogs: Array<{ accessedAt: string; ip?: string }>;
}

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Set the required server environment variables.");
  }
  return supabase;
}

function mapPatient(row: Record<string, unknown>, xrays: XRayRecord[] = []): PatientRecord {
  return {
    phone: String(row.phone),
    name: String(row.name || ""),
    email: row.email ? String(row.email) : undefined,
    notes: String(row.notes || ""),
    noShowCount: Number(row.no_show_count || 0),
    advanceTokenRequired: Boolean(row.advance_token_required),
    createdAt: String(row.created_at),
    xrays,
  };
}

function mapXRay(row: Record<string, unknown>): XRayRecord {
  return {
    id: String(row.id),
    title: String(row.title),
    category: row.category as XRayRecord["category"],
    date: String(row.date),
    url: String(row.url),
    notes: row.notes ? String(row.notes) : undefined,
  };
}

function mapSecureLink(row: Record<string, unknown>): SecureLinkRecord {
  return {
    token: String(row.token),
    patientPhone: String(row.patient_phone),
    expiresAt: String(row.expires_at),
    maxViews: Number(row.max_views),
    viewsLeft: Number(row.views_left),
    revoked: Boolean(row.revoked),
    createdAt: String(row.created_at),
    accessLogs: Array.isArray(row.access_logs) ? row.access_logs as SecureLinkRecord["accessLogs"] : [],
  };
}

export async function getOrCreatePatient(phone: string, name?: string): Promise<PatientRecord> {
  const client = requireSupabase();
  const cleanPhone = phone.trim();
  const { data: existing, error: fetchError } = await client
    .from("patients")
    .select("*")
    .eq("phone", cleanPhone)
    .maybeSingle();
  if (fetchError) throw new Error(`Failed to fetch patient: ${fetchError.message}`);

  if (existing) {
    if (name && (!existing.name || String(existing.name).startsWith("Patient "))) {
      const { data: updated, error } = await client
        .from("patients")
        .update({ name })
        .eq("phone", cleanPhone)
        .select("*")
        .single();
      if (error) throw new Error(`Failed to update patient: ${error.message}`);
      return mapPatient(updated);
    }
    return mapPatient(existing);
  }

  const { data: created, error } = await client
    .from("patients")
    .insert({
      phone: cleanPhone,
      name: name || `Patient ${cleanPhone.slice(-4)}`,
      notes: "First recorded visit.",
    })
    .select("*")
    .single();
  if (error) throw new Error(`Failed to create patient: ${error.message}`);
  return mapPatient(created);
}

export async function getAllPatientProfiles(): Promise<
  Array<PatientRecord & { appointments: AppointmentRecord[] }>
> {
  const client = requireSupabase();
  const [{ data: patients, error: patientError }, { data: xrays, error: xrayError }, appointments] =
    await Promise.all([
      client.from("patients").select("*").order("created_at", { ascending: false }),
      client.from("patient_xrays").select("*").order("created_at", { ascending: false }),
      getAllAppointments(),
    ]);
  if (patientError) throw new Error(`Failed to fetch patients: ${patientError.message}`);
  if (xrayError) throw new Error(`Failed to fetch patient X-rays: ${xrayError.message}`);

  return (patients || []).map((row) => {
    const patient = mapPatient(
      row,
      (xrays || [])
        .filter((xray) => xray.patient_phone === row.phone)
        .map(mapXRay)
    );
    return {
      ...patient,
      appointments: appointments.filter((appointment) => appointment.phone === patient.phone),
    };
  });
}

export async function updatePatientProfile(
  phone: string,
  updates: Partial<Pick<PatientRecord, "notes" | "advanceTokenRequired" | "email" | "name">>
): Promise<PatientRecord | null> {
  const client = requireSupabase();
  const payload = {
    ...(updates.notes !== undefined ? { notes: updates.notes } : {}),
    ...(updates.advanceTokenRequired !== undefined
      ? { advance_token_required: updates.advanceTokenRequired }
      : {}),
    ...(updates.email !== undefined ? { email: updates.email } : {}),
    ...(updates.name !== undefined ? { name: updates.name } : {}),
  };
  const { data, error } = await client
    .from("patients")
    .update(payload)
    .eq("phone", phone)
    .select("*")
    .maybeSingle();
  if (error) throw new Error(`Failed to update patient: ${error.message}`);
  return data ? mapPatient(data) : null;
}

export async function recordNoShow(phone: string): Promise<{
  patient: PatientRecord;
  thresholdReached: boolean;
}> {
  const client = requireSupabase();
  const patient = await getOrCreatePatient(phone);
  const noShowCount = patient.noShowCount + 1;
  const advanceTokenRequired = noShowCount >= 2;
  const { data, error } = await client
    .from("patients")
    .update({
      no_show_count: noShowCount,
      advance_token_required: advanceTokenRequired,
    })
    .eq("phone", patient.phone)
    .select("*")
    .single();
  if (error) throw new Error(`Failed to record no-show: ${error.message}`);
  const updated = mapPatient(data, patient.xrays);
  return { patient: updated, thresholdReached: updated.advanceTokenRequired };
}

export async function addPatientXRay(
  phone: string,
  record: Omit<XRayRecord, "id">
): Promise<XRayRecord> {
  const client = requireSupabase();
  await getOrCreatePatient(phone);
  const { data, error } = await client
    .from("patient_xrays")
    .insert({
      patient_phone: phone,
      title: record.title,
      category: record.category,
      date: record.date,
      url: record.url,
      notes: record.notes || "",
    })
    .select("*")
    .single();
  if (error) throw new Error(`Failed to add X-ray: ${error.message}`);
  return mapXRay(data);
}

export async function createSecurePatientLink(
  patientPhone: string,
  expiresInHours: number = 48,
  maxViews: number = 5
): Promise<SecureLinkRecord> {
  const client = requireSupabase();
  await getOrCreatePatient(patientPhone);
  const { data, error } = await client
    .from("secure_patient_links")
    .insert({
      token: crypto.randomBytes(24).toString("hex"),
      patient_phone: patientPhone,
      expires_at: new Date(Date.now() + expiresInHours * 3600000).toISOString(),
      max_views: maxViews,
      views_left: maxViews,
      revoked: false,
      access_logs: [],
    })
    .select("*")
    .single();
  if (error) throw new Error(`Failed to create secure link: ${error.message}`);
  return mapSecureLink(data);
}

export async function accessSecurePatientLink(
  token: string,
  clientIp?: string
): Promise<{
  valid: boolean;
  error?: "expired" | "no_views_left" | "revoked" | "not_found";
  patient?: PatientRecord;
  record?: SecureLinkRecord;
}> {
  const client = requireSupabase();
  const { data: row, error } = await client
    .from("secure_patient_links")
    .select("*")
    .eq("token", token)
    .maybeSingle();
  if (error) throw new Error(`Failed to load secure link: ${error.message}`);
  if (!row) return { valid: false, error: "not_found" };

  const link = mapSecureLink(row);
  if (link.revoked) return { valid: false, error: "revoked" };
  if (new Date(link.expiresAt).getTime() < Date.now()) return { valid: false, error: "expired" };
  if (link.viewsLeft <= 0) return { valid: false, error: "no_views_left" };

  const accessLogs = [...link.accessLogs, { accessedAt: new Date().toISOString(), ip: clientIp }];
  const { data: updatedRow, error: updateError } = await client
    .from("secure_patient_links")
    .update({ views_left: link.viewsLeft - 1, access_logs: accessLogs })
    .eq("token", token)
    .eq("views_left", link.viewsLeft)
    .select("*")
    .maybeSingle();
  if (updateError) throw new Error(`Failed to update secure link: ${updateError.message}`);
  if (!updatedRow) return { valid: false, error: "no_views_left" };

  const patient = await getOrCreatePatient(link.patientPhone);
  const { data: xrays, error: xrayError } = await client
    .from("patient_xrays")
    .select("*")
    .eq("patient_phone", patient.phone)
    .order("created_at", { ascending: false });
  if (xrayError) throw new Error(`Failed to load patient X-rays: ${xrayError.message}`);

  return {
    valid: true,
    patient: { ...patient, xrays: (xrays || []).map(mapXRay) },
    record: mapSecureLink(updatedRow),
  };
}

export async function revokeSecureLink(token: string): Promise<boolean> {
  const { data, error } = await requireSupabase()
    .from("secure_patient_links")
    .update({ revoked: true })
    .eq("token", token)
    .select("token")
    .maybeSingle();
  if (error) throw new Error(`Failed to revoke secure link: ${error.message}`);
  return Boolean(data);
}
