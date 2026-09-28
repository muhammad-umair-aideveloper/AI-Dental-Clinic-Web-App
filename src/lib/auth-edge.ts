const AUTH_SECRET = process.env.AUTH_SECRET || "lahore-dental-super-secure-auth-secret-key-2026";

function base64UrlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function verifySessionEdge(token: string): Promise<{
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "user";
  exp: number;
} | null> {
  try {
    if (!token || !token.includes(".")) return null;
    const [payloadStr, signatureStr] = token.split(".");

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const sigBytes = base64UrlToUint8Array(signatureStr);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as unknown as BufferSource,
      enc.encode(payloadStr)
    );

    if (!valid) return null;

    const base64 = payloadStr.replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "="));
    const payload = JSON.parse(jsonStr);

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
