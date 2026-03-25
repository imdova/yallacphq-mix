import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  adminDeleteWebinarResponseSchema,
  createWebinarBodySchema,
  listWebinarsResponseSchema,
  updateWebinarBodySchema,
  webinarNullableResponseSchema,
  webinarResponseSchema,
} from "@/lib/api/contracts/webinar";
import type { CreateWebinarInput, StoredWebinar, UpdateWebinarInput } from "@/types/webinar";

export async function getPublicWebinars(): Promise<StoredWebinar[]> {
  const res = await apiGet("/api/webinars", { schema: listWebinarsResponseSchema });
  return res.items as StoredWebinar[];
}

export async function getPublicWebinarBySlug(slug: string): Promise<StoredWebinar | null> {
  const res = await apiGet(`/api/webinars/${encodeURIComponent(slug)}`, {
    schema: webinarResponseSchema,
  });
  return (res.webinar as StoredWebinar) ?? null;
}

export async function getAdminWebinars(): Promise<StoredWebinar[]> {
  const res = await apiGet("/api/admin/webinars", { schema: listWebinarsResponseSchema });
  return res.items as StoredWebinar[];
}

export async function getAdminWebinarById(id: string): Promise<StoredWebinar | null> {
  const res = await apiGet(`/api/admin/webinars/${encodeURIComponent(id)}`, {
    schema: webinarNullableResponseSchema,
  });
  return (res.webinar as StoredWebinar | null) ?? null;
}

export async function createWebinar(data: CreateWebinarInput): Promise<StoredWebinar> {
  const body = createWebinarBodySchema.parse(data);
  const res = await apiPost("/api/admin/webinars", body, { schema: webinarResponseSchema });
  return res.webinar as StoredWebinar;
}

export async function updateWebinar(id: string, data: UpdateWebinarInput): Promise<StoredWebinar | null> {
  const body = updateWebinarBodySchema.parse(data);
  const res = await apiPatch(`/api/admin/webinars/${encodeURIComponent(id)}`, body, {
    schema: webinarResponseSchema,
  });
  return (res.webinar as StoredWebinar) ?? null;
}

export async function deleteWebinar(id: string): Promise<boolean> {
  await apiDelete(`/api/admin/webinars/${encodeURIComponent(id)}`, {
    schema: adminDeleteWebinarResponseSchema,
  });
  return true;
}
