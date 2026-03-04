import type { PromoCode, CreatePromoCodeInput, UpdatePromoCodeInput } from "@/types/promo";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import {
  adminDeletePromoCodeResponseSchema,
  listPromoCodesResponseSchema,
  promoCodeNullableResponseSchema,
  promoCodeResponseSchema,
  validatePromoCodeResponseSchema,
} from "@/lib/api/contracts/promo";

export async function fetchPromoCodes(): Promise<PromoCode[]> {
  return getPromoCodes();
}

export async function getPromoCodeById(id: string): Promise<PromoCode | null> {
  return getPromoCode(id);
}

export async function createPromoCode(data: CreatePromoCodeInput): Promise<PromoCode> {
  const res = await apiPost("/api/admin/promo-codes", data, {
    schema: promoCodeResponseSchema,
  });
  return res.promo as PromoCode;
}

export async function updatePromoCode(id: string, data: UpdatePromoCodeInput): Promise<PromoCode | null> {
  const res = await apiPatch(`/api/admin/promo-codes/${encodeURIComponent(id)}`, data, {
    schema: promoCodeResponseSchema,
  });
  return (res.promo as PromoCode) ?? null;
}

export async function deletePromoCode(id: string): Promise<boolean> {
  return deletePromoCodeById(id);
}

// ---- Phase 5 canonical API (preferred) ----

export async function getPromoCodes(): Promise<PromoCode[]> {
  const res = await apiGet("/api/admin/promo-codes", { schema: listPromoCodesResponseSchema });
  return res.items as PromoCode[];
}

export async function getPromoCode(id: string): Promise<PromoCode | null> {
  const res = await apiGet(`/api/admin/promo-codes/${encodeURIComponent(id)}`, {
    schema: promoCodeNullableResponseSchema,
  });
  return (res.promo as PromoCode | null) ?? null;
}

export async function deletePromoCodeById(id: string): Promise<boolean> {
  await apiDelete(`/api/admin/promo-codes/${encodeURIComponent(id)}`, { schema: adminDeletePromoCodeResponseSchema });
  return true;
}

export async function validatePromoCode(courseId: string, code: string) {
  return apiPost(
    "/api/promo-codes/validate",
    { courseId, code },
    { schema: validatePromoCodeResponseSchema }
  );
}
