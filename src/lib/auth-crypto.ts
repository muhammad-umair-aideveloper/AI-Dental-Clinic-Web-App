import crypto from "crypto";

const AUTH_SECRET = process.env.AUTH_SECRET || "lahore-dental-super-secure-auth-secret-key-2026";

/**
 * Hash a password using PBKDF2 with a random cryptographic salt.
 * Formats output as `salt:hash` (never plaintext).
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plaintext password against the stored `salt:hash`.
 * Uses timingSafeEqual to prevent timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(":")) return false;
    const [salt, originalHash] = storedHash.split(":");
    const computedHash = crypto
      .pbkdf2Sync(password, salt, 10000, 64, "sha512")
      .toString("hex");
    return crypto.timingSafeEqual(
      Buffer.from(computedHash, "hex"),
      Buffer.from(originalHash, "hex")
    );
  } catch (err) {
    return false;
  }
}

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  exp: number; // timestamp in ms
}

/**
 * Generate a signed session token.
 * Token format: Base64(Payload).Base64(Signature)
 */
export function createSessionToken(user: {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
}): string {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  const payload: SessionPayload = {
    id: user.id,
    name: user.name,
    email: user.email.toLowerCase(),
    phone: user.phone || "",
    role: user.role,
    exp,
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", AUTH_SECRET)
    .update(payloadStr)
    .digest("base64url");

  return `${payloadStr}.${signature}`;
}

/**
 * Verify and decode a session token. Returns null if invalid or expired.
 */
export function verifySessionToken(token: string): SessionPayload | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [payloadStr, signature] = token.split(".");

    const expectedSignature = crypto
      .createHmac("sha256", AUTH_SECRET)
      .update(payloadStr)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf8")
    );

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch (err) {
    return null;
  }
}
