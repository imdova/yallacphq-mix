import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/cookies";
import { newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function POST() {
  const requestId = newRequestId();
  const res = NextResponse.json({ ok: true }, { headers: { "x-request-id": requestId } });
  clearSessionCookie(res);
  return res;
}

