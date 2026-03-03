import { base64UrlDecode, base64UrlEncode } from "./base64url";

const DEFAULT_ITERATIONS = 120_000;
const KEY_LEN_BITS = 256;

export type PasswordHash = {
  algorithm: "pbkdf2-sha256";
  iterations: number;
  salt: string; // base64url
  hash: string; // base64url
};

async function pbkdf2Sha256(password: string, saltBytes: Uint8Array, iterations: number) {
  // TS in some configs treats Uint8Array buffers as ArrayBufferLike (incl SharedArrayBuffer).
  // WebCrypto expects a BufferSource backed by ArrayBuffer; normalize to a fresh ArrayBuffer-backed view.
  const salt =
    saltBytes.buffer instanceof ArrayBuffer ? saltBytes : new Uint8Array(saltBytes);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as unknown as BufferSource,
      iterations,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LEN_BITS
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = DEFAULT_ITERATIONS;
  const hashBytes = await pbkdf2Sha256(password, salt, iterations);
  return {
    algorithm: "pbkdf2-sha256",
    iterations,
    salt: base64UrlEncode(salt),
    hash: base64UrlEncode(hashBytes),
  };
}

export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  if (stored.algorithm !== "pbkdf2-sha256") return false;
  const saltBytes = base64UrlDecode(stored.salt);
  const expected = stored.hash;
  const actualBytes = await pbkdf2Sha256(password, saltBytes, stored.iterations);
  const actual = base64UrlEncode(actualBytes);
  return actual === expected;
}

