import type { PromoCode, CreatePromoCodeInput, UpdatePromoCodeInput } from "@/types/promo";
import { delay } from "./delay";

function clone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

let store: PromoCode[] = [];

// Seed a few demo promo codes for the admin UI.
store = [
  {
    id: "1",
    code: "WELCOME10",
    discountType: "percentage",
    discountValue: 10,
    active: true,
    maxUsageEnabled: true,
    maxUsage: 500,
    perCustomerLimitEnabled: true,
    perCustomerLimit: 1,
    restrictToProductEnabled: false,
    productId: null,
    usageCount: 128,
  },
  {
    id: "2",
    code: "FLASH25",
    discountType: "percentage",
    discountValue: 25,
    active: false,
    maxUsageEnabled: true,
    maxUsage: 50,
    perCustomerLimitEnabled: false,
    perCustomerLimit: null,
    restrictToProductEnabled: true,
    productId: "course-1",
    usageCount: 50,
  },
  {
    id: "3",
    code: "SAVE15",
    discountType: "fixed",
    discountValue: 15,
    active: true,
    maxUsageEnabled: false,
    maxUsage: null,
    perCustomerLimitEnabled: false,
    perCustomerLimit: null,
    restrictToProductEnabled: false,
    productId: null,
    usageCount: 12,
  },
];

function nextId(): string {
  const max = store.reduce((acc, p) => Math.max(acc, Number(p.id) || 0), 0);
  return String(max + 1);
}

export async function fetchPromoCodes(): Promise<PromoCode[]> {
  await delay(150);
  return store.map(clone);
}

export async function getPromoCodeById(id: string): Promise<PromoCode | null> {
  await delay(100);
  const promo = store.find((p) => p.id === id);
  return promo ? clone(promo) : null;
}

export async function createPromoCode(data: CreatePromoCodeInput): Promise<PromoCode> {
  await delay(200);
  const promo: PromoCode = {
    id: nextId(),
    code: data.code.trim().toUpperCase(),
    discountType: data.discountType,
    discountValue: data.discountValue,
    active: data.active ?? true,
    maxUsageEnabled: data.maxUsageEnabled ?? false,
    maxUsage: data.maxUsageEnabled ? (data.maxUsage ?? 0) : null,
    perCustomerLimitEnabled: data.perCustomerLimitEnabled ?? false,
    perCustomerLimit: data.perCustomerLimitEnabled ? (data.perCustomerLimit ?? 0) : null,
    restrictToProductEnabled: data.restrictToProductEnabled ?? false,
    productId: data.restrictToProductEnabled ? (data.productId ?? null) : null,
    usageCount: 0,
  };
  store = [...store, promo];
  return clone(promo);
}

export async function updatePromoCode(id: string, data: UpdatePromoCodeInput): Promise<PromoCode | null> {
  await delay(200);
  const idx = store.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const prev = store[idx];
  const updated: PromoCode = {
    ...prev,
    ...data,
    code: data.code !== undefined ? data.code.trim().toUpperCase() : prev.code,
    discountType: data.discountType ?? prev.discountType,
    discountValue: data.discountValue ?? prev.discountValue,
    active: data.active ?? prev.active,
    maxUsageEnabled: data.maxUsageEnabled ?? prev.maxUsageEnabled,
    maxUsage: data.maxUsageEnabled ? (data.maxUsage ?? prev.maxUsage ?? 0) : null,
    perCustomerLimitEnabled: data.perCustomerLimitEnabled ?? prev.perCustomerLimitEnabled,
    perCustomerLimit: data.perCustomerLimitEnabled ? (data.perCustomerLimit ?? prev.perCustomerLimit ?? 0) : null,
    restrictToProductEnabled: data.restrictToProductEnabled ?? prev.restrictToProductEnabled,
    productId: data.restrictToProductEnabled ? (data.productId ?? prev.productId) : null,
    usageCount: prev.usageCount,
  };
  store = store.map((p) => (p.id === id ? updated : p));
  return clone(updated);
}

export async function deletePromoCode(id: string): Promise<boolean> {
  await delay(200);
  const before = store.length;
  store = store.filter((p) => p.id !== id);
  return store.length !== before;
}
