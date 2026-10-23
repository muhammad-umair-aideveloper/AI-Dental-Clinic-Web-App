/**
 * Google Sheets integration for Lahore Dental.
 * Appends a new row to the configured spreadsheet on every successful booking.
 * Uses Google Sheets API v4 with a Service Account (JWT via fetch + crypto).
 * No npm packages — uses Node.js crypto + fetch only.
 *
 * Setup:
 * 1. Create a Google Cloud Service Account and download its JSON key.
 * 2. Share the spreadsheet with the service account email (Editor).
 * 3. Set GOOGLE_SHEETS_SPREADSHEET_ID and GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON in .env.
 * 4. Ensure the first sheet has header row: Timestamp | Name | Phone | Date | Time | Reason | Source | Language
 */

import crypto from "crypto";

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID ?? "";
const SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON ?? "";
const SHEET_RANGE = "Sheet1!A:H"; // Append to first sheet columns A-H
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

interface AppendRowData {
  name: string;
  phone: string;
  date: string;
  time: string;
  reason?: string;
  source?: string;
  language?: string;
}

// ─────────────────────────────────────────────
// Minimal JWT builder for Google Service Account
// ─────────────────────────────────────────────
function base64urlEncode(input: string | Buffer): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

async function getGoogleAccessToken(serviceAccountJson: string, scope: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const header = base64urlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const claim = base64urlEncode(
    JSON.stringify({
      iss: sa.client_email,
      scope,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  );
  const signingInput = `${header}.${claim}`;

  // Sign with RSA-SHA256
  const privateKey = sa.private_key as string;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signingInput);
  const sig = sign.sign(privateKey, "base64url");
  const jwt = `${signingInput}.${sig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    throw new Error(`Google OAuth error: ${err.slice(0, 200)}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token as string;
}

// ─────────────────────────────────────────────
// Public function — appends one row
// ─────────────────────────────────────────────
export async function appendBookingToSheets(data: AppendRowData): Promise<void> {
  if (!SPREADSHEET_ID || !SERVICE_ACCOUNT_JSON) {
    // No credentials configured — skip silently (demo mode)
    console.log("[Sheets] Not configured — skipping row append.");
    return;
  }

  try {
    const accessToken = await getGoogleAccessToken(SERVICE_ACCOUNT_JSON, SHEETS_SCOPE);

    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hour12: false,
    });

    const row = [
      timestamp,
      data.name,
      data.phone,
      data.date,
      data.time,
      data.reason ?? "General Consultation",
      data.source ?? "form",
      data.language ?? "en",
    ];

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(SPREADSHEET_ID)}/values/${encodeURIComponent(SHEET_RANGE)}:append?valueInputOption=USER_ENTERED`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: [row] }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Sheets] Append error:", err.slice(0, 200));
      return;
    }

    console.log("[Sheets] Row appended for:", data.name);
  } catch (err: any) {
    // Sheets failure must never break the booking
    console.error("[Sheets] Exception:", err?.message ?? err);
  }
}
