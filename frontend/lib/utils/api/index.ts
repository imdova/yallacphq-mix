import { apiErrorSchema, type ApiErrorPayload } from "@/lib/api/contracts/common";

export type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  baseUrl?: string;
  /**
   * Abort request after this many milliseconds.
   * Defaults: GET=15000ms, others=20000ms.
   */
  timeoutMs?: number;
  /**
   * Retry strategy (only applied to idempotent requests by default).
   */
  retry?: {
    retries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
  };
};

export class ApiError extends Error {
  status: number;
  body?: unknown;
  requestId?: string;
  payload?: ApiErrorPayload;

  constructor(
    message: string,
    status: number,
    body?: unknown,
    extra?: { requestId?: string; payload?: ApiErrorPayload }
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.requestId = extra?.requestId;
    this.payload = extra?.payload;
  }
}

function getHeaderValue(headers: HeadersInit | undefined, name: string): string | undefined {
  if (!headers) return undefined;
  const target = name.toLowerCase();
  if (headers instanceof Headers) {
    const v = headers.get(name);
    return v?.trim() || undefined;
  }
  if (Array.isArray(headers)) {
    for (const [k, v] of headers) {
      if (k.toLowerCase() === target) return String(v).trim() || undefined;
    }
    return undefined;
  }
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === target) return String(v).trim() || undefined;
  }
  return undefined;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function jitter(ms: number) {
  return Math.floor(ms * (0.7 + Math.random() * 0.6));
}

function isRetryableStatus(status: number) {
  return status === 408 || status === 425 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

/**
 * Lightweight fetch wrapper for JSON APIs.
 * - Sends/accepts JSON by default
 * - Throws ApiError on non-2xx responses
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { body, baseUrl, headers, timeoutMs: timeoutOverride, retry, ...init } = options;
  const url = `${baseUrl ?? ""}${path}`;
  const method = (init.method ?? "GET").toUpperCase();
  const isIdempotentGet = method === "GET" && body === undefined;

  const existingRequestId =
    getHeaderValue(headers, "x-request-id") || getHeaderValue(headers, "x-correlation-id");
  const requestIdHeader =
    existingRequestId ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`.toString());

  const timeoutMs = timeoutOverride ?? (isIdempotentGet ? 15000 : 20000);
  const signal =
    init.signal ??
    (timeoutMs &&
    typeof AbortSignal !== "undefined" &&
    "timeout" in AbortSignal &&
    typeof (AbortSignal as unknown as { timeout?: (ms: number) => AbortSignal }).timeout === "function"
      ? (AbortSignal as unknown as { timeout: (ms: number) => AbortSignal }).timeout(timeoutMs)
      : undefined);

  async function doFetch() {
    return fetch(url, {
      ...init,
      signal,
      headers: {
        Accept: "application/json",
        "x-request-id": requestIdHeader,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(headers ?? {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  const retries =
    retry?.retries ??
    (isIdempotentGet ? 2 : 0);
  const baseDelayMs = retry?.baseDelayMs ?? 250;
  const maxDelayMs = retry?.maxDelayMs ?? 3000;

  let res: Response | null = null;
  let lastErr: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      res = await doFetch();
      if (attempt < retries && isIdempotentGet && isRetryableStatus(res.status)) {
        const retryAfterRaw = res.headers.get("retry-after");
        const retryAfterMs = retryAfterRaw ? Number(retryAfterRaw) * 1000 : NaN;
        const delay = Number.isFinite(retryAfterMs)
          ? Math.min(retryAfterMs, maxDelayMs)
          : Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
        await sleep(jitter(delay));
        continue;
      }
      break;
    } catch (err) {
      lastErr = err;
      if (!(isIdempotentGet && attempt < retries)) throw err;
      const delay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
      await sleep(jitter(delay));
      continue;
    }
  }

  if (!res) throw lastErr;

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const parsed = isJson ? await res.json().catch(() => undefined) : undefined;

  if (!res.ok) {
    const requestId = res.headers.get("x-request-id")?.trim() || undefined;
    const payload = apiErrorSchema.safeParse(parsed);
    const message =
      payload.success
        ? payload.data.message
        : (parsed &&
          typeof parsed === "object" &&
          "message" in parsed &&
          typeof (parsed as Record<string, unknown>).message === "string"
            ? String((parsed as Record<string, unknown>).message)
            : `Request failed with status ${res.status}`);
    throw new ApiError(message, res.status, parsed, {
      requestId,
      ...(payload.success ? { payload: payload.data } : {}),
    });
  }

  return (parsed as T) ?? (undefined as T);
}

