import type { PasswordHash } from "./password";
import { hashPassword, verifyPassword } from "./password";

type CredentialRecord = {
  userId: string;
  email: string;
  password: PasswordHash;
};

type ResetRecord = {
  email: string;
  exp: number;
};

const credentialsByEmail = new Map<string, CredentialRecord>();
const resetTokens = new Map<string, ResetRecord>();
let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  // Seed credentials for the in-memory demo users in lib/db/users.ts (ids 1..3).
  const demo = [
    { userId: "1", email: "sarah@example.com", password: "Admin123!" },
    { userId: "2", email: "omar@example.com", password: "Member123!" },
    { userId: "3", email: "lina@example.com", password: "Viewer123!" },
  ] as const;
  await Promise.all(
    demo.map(async (u) => {
      if (credentialsByEmail.has(u.email)) return;
      credentialsByEmail.set(u.email, {
        userId: u.userId,
        email: u.email,
        password: await hashPassword(u.password),
      });
    })
  );
}

export async function setCredential(email: string, userId: string, passwordPlain: string) {
  await ensureSeeded();
  credentialsByEmail.set(email.toLowerCase(), {
    userId,
    email: email.toLowerCase(),
    password: await hashPassword(passwordPlain),
  });
}

export async function verifyCredential(email: string, passwordPlain: string): Promise<string | null> {
  await ensureSeeded();
  const rec = credentialsByEmail.get(email.toLowerCase());
  if (!rec) return null;
  const ok = await verifyPassword(passwordPlain, rec.password);
  return ok ? rec.userId : null;
}

export async function createResetToken(email: string): Promise<string> {
  await ensureSeeded();
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(tokenBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  resetTokens.set(token, { email: email.toLowerCase(), exp: Date.now() + 24 * 60 * 60 * 1000 });
  return token;
}

export async function consumeResetToken(token: string): Promise<string | null> {
  await ensureSeeded();
  const rec = resetTokens.get(token);
  if (!rec) return null;
  resetTokens.delete(token);
  if (Date.now() > rec.exp) return null;
  return rec.email;
}

