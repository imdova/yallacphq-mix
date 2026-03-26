import { ZodError, z } from "zod";
import { jsonError, jsonOk, zodIssues } from "@/lib/api/route-helpers";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import {
  publicCourseResponseSchema,
  publicCoursesResponseSchema,
} from "@/lib/api/contracts/course";
import { BACKEND_API_PREFIX, getBackendUrl, isBackendConfigured } from "@/lib/api/backend-url";
import { requireSession } from "@/lib/auth/server";
import { getCourseById } from "@/lib/db/courses";
import type { Course } from "@/types/course";
import { getVdoCipherVideoId } from "@/lib/video-source";

function isFreeCourse(course: { priceRegular?: number; priceSale?: number } | null | undefined) {
  const regular = course?.priceRegular ?? 0;
  const sale = course?.priceSale;
  const hasSale = sale != null && sale > 0 && regular > sale;
  const displayPrice = hasSale ? sale : regular;
  return displayPrice === 0;
}

async function loadPublishedCourse(courseId: string): Promise<Course | null> {
  if (isBackendConfigured()) {
    try {
      const res = await fetch(
        `${getBackendUrl()}${BACKEND_API_PREFIX}/courses/${encodeURIComponent(courseId)}`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(15000),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return null;
      const parsed = publicCourseResponseSchema.safeParse(data);
      return parsed.success ? (parsed.data.course as Course) : null;
    } catch {
      return null;
    }
  }

  const course = await getCourseById(courseId);
  if (!course || (course.status ?? "published") !== "published") {
    return null;
  }

  return course as Course;
}

function isFreePreviewVdoCipherLesson(
  course: Course,
  lessonId: string,
  requestedVideoId: string,
): boolean {
  const want = requestedVideoId.trim().toLowerCase();
  if (!want) return false;

  for (const section of course.curriculumSections ?? []) {
    for (const item of section.items ?? []) {
      if (item.type !== "lecture" || item.id !== lessonId) continue;
      if (!item.freeLecture) return false;
      const fromUrl = getVdoCipherVideoId(item.videoUrl ?? "");
      return fromUrl !== null && fromUrl.toLowerCase() === want;
    }
  }

  return false;
}

const otpRequestSchema = z.object({
  videoId: z.string().trim().min(1),
  access: z.enum(["public", "course_lesson"]).default("public"),
  courseId: z.string().trim().min(1).optional(),
  lessonId: z.string().trim().min(1).optional(),
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
  lessonId: string | undefined,
  videoId: string,
  requestId: string,
): Promise<Response | null> {
  if (!courseId) {
    return jsonError(400, "courseId is required for protected lesson playback", { requestId });
  }

  const published = await loadPublishedCourse(courseId);
  if (!published) {
    return jsonError(404, "Course not found", { requestId });
  }

  if (
    lessonId &&
    isFreePreviewVdoCipherLesson(published, lessonId, videoId)
  ) {
    return null;
  }

  if (isFreeCourse(published)) {
    return null;
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
      const accessError = await ensureCourseLessonAccess(
        req,
        body.courseId,
        body.lessonId,
        body.videoId,
        requestId,
      );
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
