import { NextResponse } from "next/server";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (!isBackendConfigured()) {
    return NextResponse.json(
      { message: "Upload not configured. Set BACKEND_URL and ensure backend has AWS S3 configured." },
      { status: 503, headers: { "x-request-id": requestId } }
    );
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { message: "Invalid form data" },
      { status: 400, headers: { "x-request-id": requestId } }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof Blob) || file.size === 0) {
    return NextResponse.json(
      { message: "No file provided. Send form field 'file'." },
      { status: 400, headers: { "x-request-id": requestId } }
    );
  }

  const backendFormData = new FormData();
  backendFormData.append("file", file);

  try {
    const res = await fetch(`${getBackendUrl()}${BACKEND_API_PREFIX}/upload/profile-image`, {
      method: "POST",
      headers: { cookie: cookieHeader, "x-request-id": requestId },
      body: backendFormData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { message: data?.message ?? "Upload failed" },
        { status: res.status, headers: { "x-request-id": requestId } }
      );
    }
    return NextResponse.json(data, { headers: { "x-request-id": requestId } });
  } catch (e) {
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Upload failed" },
      { status: 502, headers: { "x-request-id": requestId } }
    );
  }
}
