import { NextResponse } from "next/server";
import { jsonError, jsonOk } from "@/lib/api/route-helpers";
import { studentFieldOptionsResponseSchema } from "@/lib/api/contracts/settings";
import { getBackendUrl, isBackendConfigured, BACKEND_API_PREFIX } from "@/lib/api/backend-url";
import { getRequestIdFromRequest, newRequestId } from "@/lib/api/request-id";
import * as db from "@/lib/db/student-field-options";

export const dynamic = "force-dynamic";

/** Public endpoint: returns countries and specialities for signup/registration forms. No auth required. */
export async function GET(req: Request) {
  const requestId = getRequestIdFromRequest(req) ?? newRequestId();

  if (isBackendConfigured()) {
    try {
      const res = await fetch(
        `${getBackendUrl()}${BACKEND_API_PREFIX}/settings/student-fields`,
        { headers: { Accept: "application/json", "x-request-id": requestId } }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.message === "string" ? data.message : "Failed to load options";
        return NextResponse.json({ message: msg }, { status: res.status });
      }
      const parsed = studentFieldOptionsResponseSchema.safeParse(data);
      if (parsed.success) return jsonOk(parsed.data, { requestId });
      return jsonOk(data, { requestId });
    } catch (err) {
      console.error("Public student fields proxy error:", err);
      return NextResponse.json(
        { message: "Failed to load options", requestId },
        { status: 502 }
      );
    }
  }

  const options = db.getStudentFieldOptions();
  return jsonOk(studentFieldOptionsResponseSchema.parse(options), { requestId });
}
