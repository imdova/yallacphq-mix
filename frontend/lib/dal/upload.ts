/**
 * Upload images to S3 via backend. Use these from the frontend instead of sending base64.
 */

const UPLOAD_COURSE_IMAGE_URL = "/api/upload/course-image";
const UPLOAD_PROFILE_IMAGE_URL = "/api/upload/profile-image";
const UPLOAD_BANK_TRANSFER_URL = "/api/upload/bank-transfer";

export interface UploadResult {
  url: string;
}

function getServerOrigin(): string {
  if (typeof window !== "undefined") return "";
  const explicit =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  return explicit || "http://localhost:3000";
}

async function uploadFile(
  url: string,
  file: File,
  options: { baseUrl?: string } = {}
): Promise<UploadResult> {
  const baseUrl = options.baseUrl ?? (typeof window === "undefined" ? getServerOrigin() : undefined);
  const fullUrl = baseUrl ? `${baseUrl}${url}` : url;
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(fullUrl, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message ?? "Upload failed";
    throw new Error(msg);
  }
  if (!data?.url || typeof data.url !== "string") {
    throw new Error("Invalid upload response");
  }
  return { url: data.url };
}

/** Upload a course cover or instructor image (admin only). Max 5MB. Allowed: JPEG, PNG, GIF, WebP. */
export async function uploadCourseImage(file: File): Promise<UploadResult> {
  return uploadFile(UPLOAD_COURSE_IMAGE_URL, file);
}

/** Upload a profile/avatar image (authenticated user). Max 2MB. Allowed: JPEG, PNG, GIF, WebP. */
export async function uploadProfileImage(file: File): Promise<UploadResult> {
  return uploadFile(UPLOAD_PROFILE_IMAGE_URL, file);
}

/** Upload bank transfer receipt (authenticated user). Max 10MB. Allowed: JPEG, PNG, GIF, WebP, PDF. */
export async function uploadBankTransferProof(file: File): Promise<UploadResult> {
  return uploadFile(UPLOAD_BANK_TRANSFER_URL, file);
}
