import { base64UrlDecode, base64UrlEncode } from "./base64url";

export const SESSION_COOKIE_NAME = "yalla_session";

export type SessionRole = "admin" | "student" | "member" | "viewer";

export type SessionPayload = {
  uid: string;
  role: SessionRole;
  iat: number;
  exp: number;
};

function getSecret(): string {
  return process.env.AUTH_SECRET || "dev-auth-secret-change-me";
}

async function hmacSha256(message: Uint8Array, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, message as unknown as BufferSource);
  return new Uint8Array(sig);
}

export async function createSessionValue(payload: SessionPayload): Promise<string> {
  const json = JSON.stringify(payload);
  const payloadBytes = new TextEncoder().encode(json);
  const payloadPart = base64UrlEncode(payloadBytes);
  const sig = await hmacSha256(new TextEncoder().encode(payloadPart), getSecret());
  const sigPart = base64UrlEncode(sig);
  return `${payloadPart}.${sigPart}`;
}

export async function verifySessionValue(value: string): Promise<SessionPayload | null> {
  const [payloadPart, sigPart] = value.split(".");
  if (!payloadPart || !sigPart) return null;

  const expected = base64UrlEncode(
    await hmacSha256(new TextEncoder().encode(payloadPart), getSecret())
  );
  if (expected !== sigPart) return null;

  try {
    const payloadJson = new TextDecoder().decode(base64UrlDecode(payloadPart));
    const payload = JSON.parse(payloadJson) as SessionPayload;
    if (!payload?.uid || !payload?.role || !payload?.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

