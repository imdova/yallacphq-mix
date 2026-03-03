export function getRequestIdFromRequest(req: Request): string | undefined {
  const v = req.headers.get("x-request-id") || req.headers.get("x-correlation-id");
  return v?.trim() || undefined;
}

export function newRequestId(): string {
  return crypto.randomUUID();
}

