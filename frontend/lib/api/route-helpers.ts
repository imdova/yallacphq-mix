import { NextResponse } from "next/server";
import type { z } from "zod";

function ensureRequestId(requestId?: string) {
  return requestId?.trim() || crypto.randomUUID();
}

export function zodIssues(err: z.ZodError) {
  return err.issues.map((i) => ({ path: i.path, message: i.message }));
}

export function jsonError(
  status: number,
  message: string,
  extra?: { code?: string; issues?: { path: (string | number)[]; message: string }[]; requestId?: string }
) {
  const requestId = ensureRequestId(extra?.requestId);
  return NextResponse.json(
    { message, ...(extra?.code ? { code: extra.code } : {}), ...(extra?.issues ? { issues: extra.issues } : {}) },
    { status, headers: { "x-request-id": requestId } }
  );
}

export function jsonOk<T extends object>(data: T, init?: { status?: number; requestId?: string }) {
  const requestId = ensureRequestId(init?.requestId);
  return NextResponse.json(data, { status: init?.status ?? 200, headers: { "x-request-id": requestId } });
}

