import { ZodError, z } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import { publicCoursesResponseSchema } from "@/lib/api/contracts/course";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";
import { requireSession } from "@/lib/auth/server";

const otpRequestSchema = z.object({
  videoId: z.string().trim().min(1),
  access: z.enum(["public", "course_lesson"]).default("public"),
  courseId: z.string().trim().min(1).optional(),
});

const otpResponseSchema = z.object({
  otp: z.string().min(1),
  playbackInfo: z.string().min(1),
  embedUrl: z.string().url(),
});

export const dynamic = "force-dynamic";

async function ensureCourseLessonAccess(
  req: Request,
  courseId: string | undefined,
  requestId: string,
): Promise<Response | null> {
  if (!courseId) {
    return jsonError(400, "courseId is required for protected lesson playback", { requestId });
  }

  if (!isBackendConfigured()) {
    try {
      await requireSession();
    } catch {
      return jsonError(401, "UNAUTHENTICATED", { requestId });
    }
    return null;
  }

  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/courses/mine`, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        "x-request-id": requestId,
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(15000),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) return jsonError(401, "UNAUTHENTICATED", { requestId });
      if (res.status === 403) return jsonError(403, "FORBIDDEN", { requestId });
      return jsonError(res.status, "Failed to verify course access", { requestId });
    }

    const parsed = publicCoursesResponseSchema.safeParse(data);
    if (!parsed.success) {
      return jsonError(400, "Invalid course access response", {
        issues: zodIssues(parsed.error),
        requestId,
      });
    }

    const hasAccess = parsed.data.items.some((course) => course.id === courseId);
    if (!hasAccess) {
      return jsonError(403, "FORBIDDEN", { requestId });
    }
  } catch {
    return jsonError(502, "Failed to verify course access", { requestId });
  }

  return null;
}

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  try {
    const body = otpRequestSchema.parse(await req.json());

    if (body.access === "course_lesson") {
      const accessError = await ensureCourseLessonAccess(req, body.courseId, requestId);
      if (accessError) return accessError;
    }

    const apiSecret = process.env.VDOCIPHER_API_SECRET?.trim() ?? "";
    if (!apiSecret) {
      return jsonError(500, "Missing VDOCIPHER_API_SECRET", { requestId });
    }

    const baseUrl = (process.env.VDOCIPHER_API_BASE_URL?.trim() || "https://dev.vdocipher.com").replace(/\/$/, "");
    const ttlSeconds = Number(process.env.VDOCIPHER_OTP_TTL_SECONDS || "300");

    const otpRes = await fetch(
      `${baseUrl}/api/videos/${encodeURIComponent(body.videoId)}/otp`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Apisecret ${apiSecret}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ttl: Number.isFinite(ttlSeconds) ? ttlSeconds : 300 }),
        signal: AbortSignal.timeout(15000),
      },
    );

    const otpData = await otpRes.json().catch(() => ({}));
    if (!otpRes.ok) {
      const message =
        typeof otpData?.message === "string" ? otpData.message : "Failed to obtain VdoCipher OTP";
      return jsonError(otpRes.status, message, { requestId });
    }

    const otp = typeof otpData?.otp === "string" ? otpData.otp : "";
    const playbackInfo =
      typeof otpData?.playbackInfo === "string" ? otpData.playbackInfo : "";

    const response = otpResponseSchema.parse({
      otp,
      playbackInfo,
      embedUrl: `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(otp)}&playbackInfo=${encodeURIComponent(playbackInfo)}`,
    });

    return jsonOk(response, { requestId });
  } catch (err) {
    if (err instanceof ZodError) {
      return jsonError(400, "Invalid request", { issues: zodIssues(err), requestId });
    }

    return jsonError(500, "Unexpected error", { requestId });
  }
}
