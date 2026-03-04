function bytesToBinaryString(bytes: Uint8Array): string {
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function binaryStringToBytes(s: string): Uint8Array {
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) bytes[i] = s.charCodeAt(i);
  return bytes;
}

function toBase64(s: string): string {
  if (typeof btoa !== "undefined") return btoa(s);
  // Node fallback
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Buffer } = require("buffer");
  return Buffer.from(s, "binary").toString("base64");
}

function fromBase64(b64: string): string {
  if (typeof atob !== "undefined") return atob(b64);
  // Node fallback
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Buffer } = require("buffer");
  return Buffer.from(b64, "base64").toString("binary");
}

export function base64UrlEncode(data: Uint8Array): string {
  const b64 = toBase64(bytesToBinaryString(data));
  return b64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function base64UrlDecode(input: string): Uint8Array {
  const pad = input.length % 4 === 0 ? "" : "=".repeat(4 - (input.length % 4));
  const b64 = input.replaceAll("-", "+").replaceAll("_", "/") + pad;
  return binaryStringToBytes(fromBase64(b64));
}

